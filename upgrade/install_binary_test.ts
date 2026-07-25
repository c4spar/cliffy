import { test } from "@cliffy/internal/testing/test";
import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import { TarStream, type TarStreamInput } from "@std/tar";
import { join } from "@std/path";
import { getOs } from "@cliffy/internal/runtime/get-os";
import {
  installBinary,
  isPermissionDeniedError,
  swapBinary,
} from "./install_binary.ts";
import { AssetNotFoundError } from "./asset-not-found-error.ts";
import { toStream } from "./extract-binary.ts";

test({
  name: "isPermissionDenied",
  fn: async (ctx) => {
    await ctx.step({
      name: "should detect a deno permission error by its name",
      fn() {
        const error = new Error("permission denied");
        error.name = "PermissionDenied";
        assert(isPermissionDeniedError(error));
      },
    });

    await ctx.step({
      name: "should detect a node/bun permission error by its code",
      fn() {
        assert(
          isPermissionDeniedError(
            Object.assign(new Error("permission denied"), { code: "EACCES" }),
          ),
        );
        assert(
          isPermissionDeniedError(
            Object.assign(new Error("operation not permitted"), {
              code: "EPERM",
            }),
          ),
        );
      },
    });

    await ctx.step({
      name: "should not treat a missing path error as permission denied",
      fn() {
        assertEquals(
          isPermissionDeniedError(
            Object.assign(new Error("no such file"), { code: "ENOENT" }),
          ),
          false,
        );
      },
    });

    await ctx.step({
      name: "should not treat a non-error value as permission denied",
      fn() {
        assertEquals(isPermissionDeniedError("nope"), false);
      },
    });
  },
});

test({
  name: "swapBinary",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    await ctx.step({
      name: "should atomically replace the target on unix",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          const temp = join(dir, "cli.tmp");
          await Deno.writeTextFile(target, "old");
          await Deno.writeTextFile(temp, "new");

          await swapBinary(temp, target, { windows: false });

          assertEquals(await Deno.readTextFile(target), "new");
          assert(!await exists(temp));
        } finally {
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name:
        "should replace via rename-aside on windows and clean up the backup",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          const temp = join(dir, "cli.tmp");
          await Deno.writeTextFile(target, "old");
          await Deno.writeTextFile(temp, "new");
          await swapBinary(temp, target, { windows: true });
          assertEquals(await Deno.readTextFile(target), "new");
          assert(!await exists(`${target}.old`));
        } finally {
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name: "should install fresh when the target is missing on windows",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          const temp = join(dir, "cli.tmp");
          await Deno.writeTextFile(temp, "new");
          await swapBinary(temp, target, { windows: true });
          assertEquals(await Deno.readTextFile(target), "new");
        } finally {
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name: "should overwrite a stale backup left by a previous upgrade",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          const temp = join(dir, "cli.tmp");
          await Deno.writeTextFile(target, "old");
          await Deno.writeTextFile(`${target}.old`, "stale");
          await Deno.writeTextFile(temp, "new");
          await swapBinary(temp, target, { windows: true });
          assertEquals(await Deno.readTextFile(target), "new");
          assert(!await exists(`${target}.old`));
        } finally {
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name: "should surface a non-not-found error from the rename-aside",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          const temp = join(dir, "cli.tmp");
          await Deno.writeTextFile(target, "old");
          await Deno.writeTextFile(temp, "new");
          await Deno.mkdir(`${target}.old`);
          await Deno.writeTextFile(join(`${target}.old`, "keep"), "x");
          await assertRejects(() =>
            swapBinary(temp, target, { windows: true })
          );
          assertEquals(await Deno.readTextFile(target), "old");
        } finally {
          await Deno.remove(dir, { recursive: true });
        }
      },
    });
  },
});

test({
  name: "installBinary",
  fn: async (ctx) => {
    mockGlobalFetch();

    await ctx.step({
      name: "should download and install a raw binary as executable",
      async fn() {
        const dir = await makeTempDir();
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli", {
            body: new TextEncoder().encode("raw-binary"),
          });
          await installBinary(
            { url: "https://example.com/cli", name: "cli" },
            { name: "cli", location: target },
          );
          assertEquals(await readTextFile(target), "raw-binary");

          // the exec bit is unix-only.
          if (getOs() !== "windows") {
            assert(
              (await getFileMode(target)) & 0o111,
              "binary should be executable",
            );
          }
        } finally {
          resetFetch();
          await removeDir(dir);
        }
      },
    });

    await ctx.step({
      name: "should decompress a gzip asset",
      async fn() {
        const dir = await makeTempDir();
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli.gz", {
            body: await gzip(new TextEncoder().encode("gz-binary")),
          });
          await installBinary(
            { url: "https://example.com/cli.gz", name: "cli.gz" },
            { name: "cli", location: target },
          );
          assertEquals(await readTextFile(target), "gz-binary");
        } finally {
          resetFetch();
          await removeDir(dir);
        }
      },
    });

    await ctx.step({
      name: "should extract the binary from a tar.gz archive",
      async fn() {
        const dir = await makeTempDir();
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli.tar.gz", {
            body: await tarGz([
              { path: "readme.md", data: new TextEncoder().encode("docs") },
              { path: "cli", data: new TextEncoder().encode("tar-binary") },
            ]),
          });
          await installBinary(
            { url: "https://example.com/cli.tar.gz", name: "cli.tar.gz" },
            { name: "cli", location: target },
          );
          assertEquals(await readTextFile(target), "tar-binary");
        } finally {
          resetFetch();
          await removeDir(dir);
        }
      },
    });

    await ctx.step({
      name: "should throw when the binary is missing from the archive",
      async fn() {
        const dir = await makeTempDir();
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli.tar.gz", {
            body: await tarGz([
              { path: "other", data: new TextEncoder().encode("nope") },
            ]),
          });
          await assertRejects(
            () =>
              installBinary(
                { url: "https://example.com/cli.tar.gz", name: "cli.tar.gz" },
                { name: "cli", location: target },
              ),
            AssetNotFoundError,
            "other",
          );
        } finally {
          resetFetch();
          await removeDir(dir);
        }
      },
    });

    await ctx.step({
      name: "should use a custom extractor when provided",
      async fn() {
        const dir = await makeTempDir();
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli.zip", {
            body: new TextEncoder().encode("packed"),
          });
          await installBinary(
            {
              url: "https://example.com/cli.zip",
              name: "cli.zip",
              extract: () => new TextEncoder().encode("unpacked"),
            },
            { name: "cli", location: target },
          );
          assertEquals(await readTextFile(target), "unpacked");
        } finally {
          resetFetch();
          await removeDir(dir);
        }
      },
    });

    await ctx.step({
      name: "should install into a directory location using the cli name",
      async fn() {
        const dir = await makeTempDir();
        try {
          mockFetch("https://example.com/cli", {
            body: new TextEncoder().encode("raw-binary"),
          });
          await installBinary(
            { url: "https://example.com/cli", name: "cli" },
            { name: "mycli", location: dir },
          );
          const fileName = getOs() === "windows" ? "mycli.exe" : "mycli";
          assertEquals(
            await readTextFile(join(dir, fileName)),
            "raw-binary",
          );
        } finally {
          resetFetch();
          await removeDir(dir);
        }
      },
    });

    resetGlobalFetch();
  },
});

async function streamToUint8Array(stream: ReadableStream<Uint8Array>) {
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gzip(bytes: Uint8Array) {
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  if (!Deno) {
    const { gzipSync } = await import("node:zlib");
    return new Uint8Array(gzipSync(bytes));
  }
  return streamToUint8Array(
    toStream(bytes).pipeThrough(
      new CompressionStream("gzip") as unknown as ReadableWritablePair<
        Uint8Array,
        Uint8Array
      >,
    ),
  );
}

async function tarGz(files: Array<{ path: string; data: Uint8Array }>) {
  const inputs: Array<TarStreamInput> = files.map(({ path, data }) => ({
    type: "file",
    path,
    size: data.byteLength,
    readable: toStream(data),
  }));
  // `ReadableStream.from(inputs)` isn't available on bun.
  const source = new ReadableStream<TarStreamInput>({
    start(controller) {
      for (const input of inputs) {
        controller.enqueue(input);
      }
      controller.close();
    },
  });
  const tar = await streamToUint8Array(
    source.pipeThrough(new TarStream()) as ReadableStream<Uint8Array>,
  );
  return gzip(tar);
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

async function makeTempDir(): Promise<string> {
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  if (Deno) {
    return await Deno.makeTempDir({ dir: "." });
  }
  const { mkdtemp } = await import("node:fs/promises");
  return mkdtemp("cliffy-install-");
}

async function readTextFile(path: string): Promise<string> {
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  if (Deno) {
    return await Deno.readTextFile(path);
  }
  const { readFile } = await import("node:fs/promises");
  return readFile(path, "utf8");
}

async function getFileMode(path: string): Promise<number> {
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  if (Deno) {
    return (await Deno.stat(path)).mode ?? 0;
  }
  const { stat } = await import("node:fs/promises");
  return (await stat(path)).mode ?? 0;
}

async function removeDir(path: string): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  if (Deno) {
    await Deno.remove(path, { recursive: true });
    return;
  }
  const { rm } = await import("node:fs/promises");
  await rm(path, { recursive: true, force: true });
}

import { test } from "@cliffy/internal/testing/test";
import { assert, assertEquals } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { TarStream, type TarStreamInput } from "@std/tar";
import { extractBinary, extractTarBytes, toStream } from "./extract-binary.ts";
import type { BinaryAsset } from "./provider.ts";

const options = { name: "cli" };

const empty = new Uint8Array(0);

test({
  name: "extractBinary",
  fn: async (ctx) => {
    await ctx.step({
      name: "should run a function extractor for a non-built-in type",
      async fn() {
        const extract = spy(() => encode("unpacked"));
        const asset: BinaryAsset = {
          url: "https://example.com/cli.zip",
          name: "cli.zip",
          extract,
        };
        const result = await extractBinary(empty, asset, options);
        assertSpyCalls(extract, 1);
        assertEquals(decode(result), "unpacked");
      },
    });

    await ctx.step({
      name: "should let a function override a built-in extractor",
      async fn() {
        const asset: BinaryAsset = {
          url: "https://example.com/cli.gz",
          name: "cli.gz",
          extract: () => encode("override"),
        };
        const result = await extractBinary(
          await gzip("gz-binary"),
          asset,
          options,
        );
        assertEquals(decode(result), "override");
      },
    });

    await ctx.step({
      name: "should select the record entry with the longest matching suffix",
      async fn() {
        const asset: BinaryAsset = {
          url: "https://example.com/cli.tar.gz",
          name: "cli.tar.gz",
          extract: {
            ".gz": () => encode("gz"),
            ".tar.gz": () => encode("tar.gz"),
          },
        };
        const result = await extractBinary(empty, asset, options);
        assertEquals(decode(result), "tar.gz");
      },
    });

    await ctx.step({
      name: "should let a record entry override a built-in extractor",
      async fn() {
        const asset: BinaryAsset = {
          url: "https://example.com/cli.tar.gz",
          name: "cli.tar.gz",
          extract: {
            ".tar.gz": () => encode("custom"),
          },
        };
        const result = await extractBinary(
          encode("not-an-archive") as Uint8Array,
          asset,
          options,
        );
        assertEquals(decode(result), "custom");
      },
    });

    await ctx.step({
      name: "should fall back to a built-in when no record entry matches",
      async fn() {
        const extract = spy(() => encode("zip"));
        const asset: BinaryAsset = {
          url: "https://example.com/cli.gz",
          name: "cli.gz",
          extract: { ".zip": extract },
        };
        const result = await extractBinary(
          await gzip("gz-binary"),
          asset,
          options,
        );
        assertSpyCalls(extract, 0);
        assertEquals(decode(result), "gz-binary");
      },
    });

    await ctx.step({
      name: "should return the raw bytes when nothing matches",
      async fn() {
        const asset: BinaryAsset = {
          url: "https://example.com/cli",
          name: "cli",
          extract: { ".zip": () => encode("zip") },
        };
        const result = await extractBinary(
          encode("raw") as Uint8Array,
          asset,
          options,
        );
        assertEquals(decode(result), "raw");
      },
    });
  },
});

test({
  name: "extractTarBytes",
  fn: async (ctx) => {
    await ctx.step({
      name: "should extract a file entry by its base name",
      async fn() {
        const bytes = await tar([
          { path: "readme.md", data: encode("docs") },
          { path: "dir/cli", data: encode("tar-binary") },
        ]);
        const { binary } = extractTarBytes(bytes, "cli");
        assertEquals(binary && decode(binary), "tar-binary");
      },
    });

    await ctx.step({
      name: "should report available entries when the binary is missing",
      async fn() {
        const bytes = await tar([{ path: "other", data: encode("nope") }]);
        const { binary, entries } = extractTarBytes(bytes, "cli");
        assertEquals(binary, undefined);
        assert(entries.includes("other"));
      },
    });
  },
});

async function tar(
  files: Array<{ path: string; data: Uint8Array }>,
): Promise<Uint8Array> {
  const inputs: Array<TarStreamInput> = files.map(({ path, data }) => ({
    type: "file",
    path,
    size: data.byteLength,
    readable: toStream(data),
  }));
  const source = new ReadableStream<TarStreamInput>({
    start(controller) {
      for (const input of inputs) {
        controller.enqueue(input);
      }
      controller.close();
    },
  });
  return new Uint8Array(
    await new Response(
      source.pipeThrough(new TarStream()) as ReadableStream<Uint8Array>,
    ).arrayBuffer(),
  );
}

async function gzip(text: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  if (!Deno) {
    const { gzipSync } = await import("node:zlib");
    return new Uint8Array(gzipSync(bytes));
  }
  return new Uint8Array(
    await new Response(
      toStream(bytes).pipeThrough(
        new CompressionStream("gzip") as unknown as ReadableWritablePair<
          Uint8Array,
          Uint8Array
        >,
      ),
    ).arrayBuffer(),
  );
}

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

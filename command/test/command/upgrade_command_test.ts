import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import { join } from "@std/path";
import {
  type BinaryAsset,
  type BinaryUpgradeContext,
  Provider,
  UnsupportedVersionListingError,
  type Versions,
} from "@cliffy/upgrade";
import { UrlProvider } from "@cliffy/upgrade/provider/url";
import { Command } from "../../command.ts";
import { UpgradeCommand } from "../../upgrade/upgrade_command.ts";
import { checkVersion } from "../../upgrade/_check_version.ts";

class TestProvider extends Provider {
  readonly name: string;
  readonly #binary: boolean;

  constructor(name = "test", binary = true) {
    super({});
    this.name = name;
    this.#binary = binary;
  }

  override get supportsBinaryUpgrade(): boolean {
    return this.#binary;
  }

  hasRequiredPermissions(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getVersions(): Promise<Versions> {
    return Promise.resolve({ latest: "1.0.0", versions: ["1.0.0"] });
  }

  getRepositoryUrl(): string {
    return "https://example.com/repo";
  }

  getRegistryUrl(): string {
    return "https://example.com/registry";
  }

  override getBinaryAsset(
    _context: BinaryUpgradeContext,
  ): Promise<BinaryAsset> {
    return Promise.resolve({ url: "https://example.com/cli", name: "cli" });
  }
}

function createCli(
  envPrefix?: string,
  provider: Provider | Array<Provider> = new TestProvider(),
) {
  return new Command()
    .throwErrors()
    .name("mycli")
    .version("0.9.0")
    .command(
      "upgrade",
      new UpgradeCommand({
        provider,
        standalone: true,
        spinner: false,
        outputEnv: envPrefix ? { prefix: `${envPrefix}_` } : undefined,
      }),
    );
}

test({
  name: "UpgradeCommand binary upgrade",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    mockGlobalFetch();

    await ctx.step({
      name: "should install to the location given by the --output option",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli", {
            body: new TextEncoder().encode("from-flag"),
          });
          await createCli().parse([
            "upgrade",
            "--force",
            "--version",
            "1.0.0",
            "--output",
            target,
          ]);
          assertEquals(await Deno.readTextFile(target), "from-flag");
        } finally {
          resetFetch();
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name: "should install to the location given by the env var",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          Deno.env.set("MYCLI_OUTPUT", target);
          mockFetch("https://example.com/cli", {
            body: new TextEncoder().encode("from-env"),
          });
          await createCli("MYCLI").parse([
            "upgrade",
            "--force",
            "--version",
            "1.0.0",
          ]);
          assertEquals(await Deno.readTextFile(target), "from-env");
        } finally {
          Deno.env.delete("MYCLI_OUTPUT");
          resetFetch();
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name: "should let the --output option override the env var",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const fromEnv = join(dir, "env-cli");
          const fromFlag = join(dir, "flag-cli");
          Deno.env.set("MYCLI_OUTPUT", fromEnv);
          mockFetch("https://example.com/cli", {
            body: new TextEncoder().encode("from-flag"),
          });
          await createCli("MYCLI").parse([
            "upgrade",
            "--force",
            "--version",
            "1.0.0",
            "--output",
            fromFlag,
          ]);
          assertEquals(await Deno.readTextFile(fromFlag), "from-flag");
          assertEquals(await exists(fromEnv), false);
        } finally {
          Deno.env.delete("MYCLI_OUTPUT");
          resetFetch();
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    await ctx.step({
      name:
        "should select the first binary capable registry when none is given",
      async fn() {
        const dir = await Deno.makeTempDir({ dir: "." });
        try {
          const target = join(dir, "cli");
          mockFetch("https://example.com/cli", {
            body: new TextEncoder().encode("from-binary-registry"),
          });
          await createCli(undefined, [
            new TestProvider("script", false),
            new TestProvider("binary", true),
          ]).parse([
            "upgrade",
            "--force",
            "--version",
            "1.0.0",
            "--output",
            target,
          ]);
          assertEquals(
            await Deno.readTextFile(target),
            "from-binary-registry",
          );
        } finally {
          resetFetch();
          await Deno.remove(dir, { recursive: true });
        }
      },
    });

    resetGlobalFetch();
  },
});

test({
  name: "UpgradeCommand --output registration",
  fn: async (ctx) => {
    await ctx.step({
      name: "should reject --output when no provider supports binary upgrade",
      async fn() {
        await assertRejects(
          () =>
            createCli(undefined, [new TestProvider("script", false)]).parse([
              "upgrade",
              "--output",
              "./cli",
            ]),
          Error,
          'Unknown option "--output".',
        );
      },
    });
  },
});

test({
  name:
    "should skip automatic version checks when the provider cannot list versions",
  async fn() {
    await checkVersion(
      createCli(
        undefined,
        new UrlProvider({ asset: "https://example.com/cli" }),
      ),
    );
  },
});

test({
  name: "should register version-listing features only when supported",
  fn: async (ctx) => {
    await ctx.step({
      name: "should omit the option and completion without a version resolver",
      fn() {
        const command = new UpgradeCommand({
          provider: new UrlProvider({ asset: "https://example.com/cli" }),
          spinner: false,
        });

        assertEquals(command.getOption("list-versions"), undefined);
        assertEquals(command.getCompletion("version"), undefined);
      },
    });

    await ctx.step({
      name: "should register the option when any provider lists versions",
      async fn() {
        const command = new UpgradeCommand({
          provider: [
            new UrlProvider({ asset: "https://example.com/cli" }),
            new TestProvider(),
          ],
          spinner: false,
        });

        assertEquals(command.getOption("list-versions")?.name, "list-versions");
        assertEquals(command.getCompletion("version")?.name, "version");
        assertEquals(await command.getAllVersions(), ["1.0.0"]);
      },
    });

    await ctx.step({
      name: "should reject listing from an unsupported selected provider",
      async fn() {
        await assertRejects(
          () =>
            createCli(undefined, [
              new UrlProvider({ asset: "https://example.com/cli" }),
              new TestProvider(),
            ]).parse([
              "upgrade",
              "--registry",
              "url",
              "--list-versions",
            ]),
          UnsupportedVersionListingError,
          `The "url" provider has no version list.`,
        );
      },
    });
  },
});

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

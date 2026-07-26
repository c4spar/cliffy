import { test } from "@cliffy/internal/testing/test";
import { getRuntimeName } from "@cliffy/internal/runtime/runtime-name";
import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import {
  mockCommand,
  mockGlobalCommand,
  resetCommand,
  resetGlobalCommand,
} from "@c4spar/mock-command";
import { UrlProvider, type UrlProviderOptions } from "./url.ts";
import { upgrade } from "../upgrade.ts";
import { UnsupportedUpgradeError } from "../unsupported-upgrade-error.ts";
import {
  UnsupportedVersionListingError,
} from "../unsupported-version-listing-error.ts";

const context = {
  name: "cli",
  version: "1.0.0",
  os: "darwin",
  arch: "aarch64",
};

test({
  name: "should provide URL-based upgrades",
  fn: async (t) => {
    await t.step({
      name: "should expose the configured upgrade capabilities",
      fn() {
        const scriptProvider = new UrlProvider({
          url: "https://example.com/cli.ts",
        });
        const binaryProvider = new UrlProvider({
          asset: "https://example.com/cli",
        });
        const combinedProvider = new UrlProvider({
          url: "https://example.com/cli.ts",
          asset: "https://example.com/cli",
        });
        const supportsScriptUpgrade = getRuntimeName() === "deno";

        assertEquals(
          scriptProvider.supportsScriptUpgrade,
          supportsScriptUpgrade,
        );
        assertEquals(scriptProvider.supportsBinaryUpgrade, false);
        assertEquals(binaryProvider.supportsScriptUpgrade, false);
        assertEquals(binaryProvider.supportsBinaryUpgrade, true);
        assertEquals(
          combinedProvider.supportsScriptUpgrade,
          supportsScriptUpgrade,
        );
        assertEquals(combinedProvider.supportsBinaryUpgrade, true);
        assertEquals(combinedProvider.supportsVersionListing, false);
      },
    });

    await t.step({
      name: "should resolve the exact script entrypoint on deno",
      fn() {
        const provider = new UrlProvider({
          url: ({ name, version }) =>
            `https://example.com/${name}/${version}/cli.ts`,
        });
        if (getRuntimeName() === "deno") {
          assertEquals(
            provider.getSpecifier("cli", "1.0.0"),
            "https://example.com/cli/1.0.0/cli.ts",
          );
        } else {
          assertThrows(
            () => provider.getSpecifier("cli", "1.0.0"),
            UnsupportedUpgradeError,
            `Script upgrades with the "url" provider are only supported on Deno.`,
          );
        }
      },
    });

    await t.step({
      name: "should upgrade a deno script from the exact url",
      ignore: ["node", "bun"],
      async fn() {
        const infoCalls: Array<Array<unknown>> = [];
        mockGlobalCommand();
        mockCommand({
          command: Deno.execPath(),
          args: [
            "install",
            "--name=cli",
            "--global",
            "--force",
            "--quiet",
            "https://example.com/cli/1.1.0/cli.ts",
          ],
          stdout: "piped",
          stderr: "piped",
        });

        try {
          await upgrade({
            name: "cli",
            from: "1.0.0",
            to: "latest",
            standalone: false,
            provider: new UrlProvider({
              url: ({ name, version }) =>
                `https://example.com/${name}/${version}/cli.ts`,
              versions: {
                latest: "1.1.0",
                versions: ["1.1.0", "1.0.0"],
              },
            }),
            logger: {
              log() {},
              info(...data) {
                infoCalls.push(data);
              },
              warn() {},
              error() {},
            },
          });
          const infoCall = infoCalls.at(-1);
          assertEquals(infoCall?.length, 1);
          assertStringIncludes(
            String(infoCall?.[0]),
            "Successfully upgraded",
          );
        } finally {
          resetCommand();
          resetGlobalCommand();
        }
      },
    });

    await t.step({
      name: "should resolve the asset from a url function",
      async fn() {
        const provider = new UrlProvider({
          asset: (c) =>
            `https://cdn.example.com/${c.name}/${c.version}/${c.name}-${c.os}-${c.arch}.tar.gz`,
        });
        const asset = await provider.getBinaryAsset(context);
        assertEquals(
          asset.url,
          "https://cdn.example.com/cli/1.0.0/cli-darwin-aarch64.tar.gz",
        );
        assertEquals(asset.name, "cli-darwin-aarch64.tar.gz");
      },
    });

    await t.step({
      name:
        "should derive the asset name from the url basename, ignoring query",
      async fn() {
        const provider = new UrlProvider({
          asset: "https://cdn.example.com/downloads/cli.gz?token=abc",
        });
        const asset = await provider.getBinaryAsset(context);
        assertEquals(asset.name, "cli.gz");
      },
    });

    await t.step({
      name: "should use an explicit asset name returned by a resolver",
      async fn() {
        const provider = new UrlProvider({
          asset: ({ name, version }) => ({
            url:
              `https://cdn.example.com/download?name=${name}&version=${version}`,
            name: `${name}.tar.gz`,
          }),
        });
        const asset = await provider.getBinaryAsset(context);
        assertEquals(
          asset.url,
          "https://cdn.example.com/download?name=cli&version=1.0.0",
        );
        assertEquals(asset.name, "cli.tar.gz");
      },
    });

    await t.step({
      name: "should apply resolved headers",
      async fn() {
        const provider = new UrlProvider({
          asset: "https://example.com/cli",
          assetHeaders: () => ({ Authorization: "Bearer secret" }),
        });
        const asset = await provider.getBinaryAsset(context);
        assertEquals(
          new Headers(asset.headers).get("Authorization"),
          "Bearer secret",
        );
      },
    });

    await t.step({
      name: "should return versions from the resolver",
      async fn() {
        const provider = new UrlProvider({
          asset: "https://example.com/cli",
          versions: { latest: "1.0.0", versions: ["1.0.0", "0.9.0"] },
        });
        assertEquals(provider.supportsVersionListing, true);
        assertEquals((await provider.getVersions("cli")).latest, "1.0.0");
      },
    });

    await t.step({
      name: "should not require permissions for static versions",
      async fn() {
        const provider = new UrlProvider({
          asset: "https://example.com/cli",
          versions: { latest: "1.0.0", versions: ["1.0.0"] },
        });
        assertEquals(await provider.hasRequiredPermissions(), true);
      },
    });

    await t.step({
      name: "should require an explicit permission check for resolved versions",
      async fn() {
        const versions = () => ({
          latest: "1.0.0",
          versions: ["1.0.0"],
        });
        assertEquals(
          await new UrlProvider({
            asset: "https://example.com/cli",
            versions,
          }).hasRequiredPermissions(),
          false,
        );
        assertEquals(
          await new UrlProvider({
            asset: "https://example.com/cli",
            versions,
            hasRequiredPermissions: () => true,
          }).hasRequiredPermissions(),
          true,
        );
      },
    });

    await t.step({
      name: "should not have permissions without a versions resolver",
      async fn() {
        const provider = new UrlProvider({ asset: "https://example.com/cli" });
        assertEquals(await provider.hasRequiredPermissions(), false);
      },
    });

    await t.step({
      name: "should not be outdated when the explicit version is installed",
      async fn() {
        const provider = new UrlProvider({ asset: "https://example.com/cli" });
        assertEquals(
          await provider.isOutdated("cli", "1.0.0", "1.0.0"),
          false,
        );
        assertEquals(
          await provider.isOutdated("cli", "1.0.0", "1.1.0"),
          true,
        );
      },
    });

    await t.step({
      name: "should require a script url or binary asset",
      fn() {
        assertThrows(
          () => new UrlProvider({} as UrlProviderOptions),
          TypeError,
          `The "url" provider requires a \`url\` or \`asset\` option.`,
        );
      },
    });

    await t.step({
      name: "should reject main when resolving the script specifier",
      fn() {
        const provider = new UrlProvider({
          url: "https://example.com/cli.ts",
        });
        assertThrows(
          () => provider.getSpecifier("cli", "1.0.0", "cli.ts"),
          TypeError,
          `The "url" provider does not support the \`main\` option`,
        );
      },
    });

    await t.step({
      name: "should reject invalid static urls",
      fn() {
        assertThrows(
          () => new UrlProvider({ asset: "./cli.tar.gz" }),
          TypeError,
          `The "asset" option must be an absolute URL.`,
        );
        assertThrows(
          () => new UrlProvider({ url: "" }),
          TypeError,
          `The "url" option must be an absolute URL.`,
        );
        assertThrows(
          () =>
            new UrlProvider({
              asset: "https://example.com/cli",
              homepage: "./releases",
            }),
          TypeError,
          `The "homepage" option must be an absolute URL.`,
        );
        assertThrows(
          () =>
            new UrlProvider({
              asset: {
                url: "https://example.com/download",
                name: " ",
              },
            }),
          TypeError,
          `The "asset" option must provide a non-empty asset name.`,
        );
      },
    });

    await t.step({
      name: "should reject invalid urls returned by resolvers",
      async fn() {
        const binaryProvider = new UrlProvider({ asset: () => "./cli.tar.gz" });
        await assertRejects(
          () => binaryProvider.getBinaryAsset(context),
          TypeError,
          `The "asset" option must be an absolute URL.`,
        );

        if (getRuntimeName() === "deno") {
          const scriptProvider = new UrlProvider({ url: () => "./cli.ts" });
          assertThrows(
            () => scriptProvider.getSpecifier("cli", "1.0.0"),
            TypeError,
            `The "url" option must be an absolute URL.`,
          );
        }
      },
    });

    await t.step({
      name: "should throw for directly requested unconfigured operations",
      async fn() {
        const scriptProvider = new UrlProvider({
          url: "https://example.com/cli.ts",
        });
        await assertRejects(
          () => scriptProvider.getBinaryAsset(context),
          UnsupportedUpgradeError,
          `The "url" provider has no binary asset.`,
        );

        const binaryProvider = new UrlProvider({
          asset: "https://example.com/cli",
        });
        assertThrows(
          () => binaryProvider.getRegistryUrl("cli", "1.0.0"),
          UnsupportedUpgradeError,
          `The "url" provider has no script url.`,
        );
      },
    });

    await t.step({
      name: "should throw from getVersions without a resolver",
      async fn() {
        const provider = new UrlProvider({ asset: "https://example.com/cli" });
        await assertRejects(
          () => provider.getVersions("cli"),
          UnsupportedVersionListingError,
        );
      },
    });
  },
});

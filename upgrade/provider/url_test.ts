import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { UrlProvider } from "./url.ts";
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
  name: "UrlProvider",
  fn: async (t) => {
    await t.step({
      name: "should support binary but not script upgrades",
      fn() {
        const provider = new UrlProvider({ url: "https://example.com/cli" });
        assertEquals(provider.supportsBinaryUpgrade, true);
        assertEquals(provider.supportsScriptUpgrade, false);
        assertEquals(provider.supportsVersionListing, false);
      },
    });

    await t.step({
      name: "should resolve the asset from a url function",
      async fn() {
        const provider = new UrlProvider({
          url: (c) =>
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
          url: "https://cdn.example.com/downloads/cli.gz?token=abc",
        });
        const asset = await provider.getBinaryAsset(context);
        assertEquals(asset.name, "cli.gz");
      },
    });

    await t.step({
      name: "should apply resolved headers",
      async fn() {
        const provider = new UrlProvider({
          url: "https://example.com/cli",
          headers: () => ({ Authorization: "Bearer secret" }),
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
          url: "https://example.com/cli",
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
          url: "https://example.com/cli",
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
            url: "https://example.com/cli",
            versions,
          }).hasRequiredPermissions(),
          false,
        );
        assertEquals(
          await new UrlProvider({
            url: "https://example.com/cli",
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
        const provider = new UrlProvider({ url: "https://example.com/cli" });
        assertEquals(await provider.hasRequiredPermissions(), false);
      },
    });

    await t.step({
      name: "should not be outdated when the explicit version is installed",
      async fn() {
        const provider = new UrlProvider({ url: "https://example.com/cli" });
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
      name: "should throw from getVersions without a resolver",
      async fn() {
        const provider = new UrlProvider({ url: "https://example.com/cli" });
        await assertRejects(
          () => provider.getVersions("cli"),
          UnsupportedVersionListingError,
        );
      },
    });
  },
});

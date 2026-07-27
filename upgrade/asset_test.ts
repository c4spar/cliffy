import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { resolveAssetName, resolveBinaryName } from "./asset.ts";
import { AssetNotFoundError } from "./asset-not-found-error.ts";

const context = { name: "cli", version: "1.0.0", os: "darwin", arch: "x86_64" };

test({
  name: "resolveAssetName",
  fn: async (t) => {
    await t.step({
      name: "should resolve from an os-arch map",
      fn() {
        assertEquals(
          resolveAssetName({ "darwin-x86_64": "cli.tar.gz" }, context),
          "cli.tar.gz",
        );
      },
    });

    await t.step({
      name: "should resolve from a function",
      fn() {
        assertEquals(
          resolveAssetName((c) => `cli-${c.os}-${c.arch}.gz`, context),
          "cli-darwin-x86_64.gz",
        );
      },
    });

    await t.step({
      name: "should throw for an unconfigured target",
      fn() {
        assertThrows(
          () => resolveAssetName({ "linux-x86_64": "x" }, context),
          AssetNotFoundError,
          "darwin-x86_64",
        );
      },
    });

    await t.step({
      name: "should throw when no asset is configured",
      fn() {
        assertThrows(
          () => resolveAssetName(undefined, context),
          AssetNotFoundError,
        );
      },
    });
  },
});

test({
  name: "resolveBinaryName",
  fn: async (t) => {
    await t.step({
      name: "should default to the cli name",
      fn() {
        assertEquals(resolveBinaryName(undefined, context), "cli");
      },
    });

    await t.step({
      name: "should return a static name",
      fn() {
        assertEquals(resolveBinaryName("mycli", context), "mycli");
      },
    });

    await t.step({
      name: "should resolve from a function",
      fn() {
        assertEquals(
          resolveBinaryName((c) => `${c.name}-${c.os}`, context),
          "cli-darwin",
        );
      },
    });
  },
});

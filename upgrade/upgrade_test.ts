import { test } from "@cliffy/internal/testing/test";
import { assertRejects } from "@std/assert";
import { upgrade } from "./upgrade.ts";
import { UnsupportedUpgradeError } from "./unsupported-upgrade-error.ts";
import { GithubProvider } from "./provider/github.ts";
import { Provider, type Versions } from "./provider.ts";

/** A binary-only provider, like the planned url provider. */
class BinaryOnlyProvider extends Provider {
  name = "binary-only";

  constructor() {
    super();
  }

  override get supportsScriptUpgrade(): boolean {
    return false;
  }

  hasRequiredPermissions(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getVersions(): Promise<Versions> {
    return Promise.resolve({ latest: "1.0.0", versions: ["1.0.0"] });
  }

  getRepositoryUrl(): string {
    return "";
  }

  getRegistryUrl(): string {
    return "";
  }
}

test({
  name: "upgrade binary routing",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    await ctx.step({
      name:
        "should throw when standalone but the provider doesn't support binary upgrade",
      async fn() {
        await assertRejects(
          () =>
            upgrade({
              name: "cli",
              to: "1.0.0",
              from: "0.9.0",
              force: true,
              standalone: true,
              provider: new GithubProvider({ repository: "user/repo" }),
            }),
          UnsupportedUpgradeError,
        );
      },
    });

    await ctx.step({
      name:
        "should throw when not standalone but the provider doesn't support script upgrade",
      async fn() {
        await assertRejects(
          () =>
            upgrade({
              name: "cli",
              to: "1.0.0",
              from: "0.9.0",
              force: true,
              standalone: false,
              provider: new BinaryOnlyProvider(),
            }),
          UnsupportedUpgradeError,
          "binary-only",
        );
      },
    });
  },
});

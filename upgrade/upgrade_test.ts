import { test } from "@cliffy/internal/testing/test";
import { assertRejects } from "@std/assert";
import { upgrade } from "./upgrade.ts";
import { UnsupportedUpgradeError } from "./unsupported-upgrade-error.ts";
import { GithubProvider } from "./provider/github.ts";
import { UrlProvider } from "./provider/url.ts";

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
              provider: new UrlProvider({ asset: "https://example.com/cli" }),
            }),
          UnsupportedUpgradeError,
          `Upgrading via a script is not supported by the "url" registry.`,
        );
      },
    });
  },
});

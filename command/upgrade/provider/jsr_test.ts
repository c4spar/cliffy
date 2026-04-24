import { test } from "@cliffy/internal/testing/test";
import { assert, assertEquals } from "@std/assert";
import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import { upgrade } from "../upgrade.ts";
import { JsrProvider } from "./jsr.ts";
import {
  mockCommand,
  mockGlobalCommand,
  resetCommand,
  resetGlobalCommand,
} from "@c4spar/mock-command";

test({
  name: "JsrProvider",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    mockGlobalFetch();
    mockGlobalCommand();

    const provider = new JsrProvider({
      scope: "example",
    });

    await ctx.step({
      name: "should return registry url",
      fn() {
        assertEquals(
          provider.getRegistryUrl("foo", "1.0.0"),
          "jsr:@example/foo@1.0.0",
        );
      },
    });

    await ctx.step({
      name: "should return repository url",
      fn() {
        assertEquals(
          provider.getRepositoryUrl("foo"),
          "https://jsr.io/@example/foo",
        );
      },
    });

    await ctx.step({
      name: "should return versions",
      async fn() {
        mockFetch("https://jsr.io/@example/foo/meta.json", {
          body: JSON.stringify({
            latest: "1.0.1",
            versions: {
              "1.0.1": null,
              "1.0.0": null,
            },
          }),
        });
        const versions = await provider.getVersions("foo");

        assertEquals(versions, {
          latest: "1.0.1",
          versions: ["1.0.1", "1.0.0"],
        });

        resetFetch();
      },
    });

    await ctx.step({
      name: "should check if version is outdated",
      async fn() {
        const mock = {
          body: JSON.stringify({
            latest: "1.0.1",
            versions: {
              "1.0.1": null,
              "1.0.0": null,
            },
          }),
        };

        mockFetch("https://jsr.io/@example/foo/meta.json", mock);
        const isOutdated = await provider.isOutdated("foo", "1.0.0", "latest");
        assert(isOutdated);

        mockFetch("https://jsr.io/@example/foo/meta.json", mock);
        const isNotOutdated = !await provider.isOutdated(
          "foo",
          "1.0.1",
          "latest",
        );
        assert(isNotOutdated);

        resetFetch();
      },
    });

    await ctx.step({
      name: "should upgrade to latest version",
      ignore: ["node"],
      async fn() {
        const versionsResponse = {
          body: JSON.stringify({
            latest: "1.0.1",
            versions: {
              "1.0.1": null,
              "1.0.0": null,
            },
          }),
        };
        mockFetch("https://jsr.io/@example/foo/meta.json", versionsResponse);
        mockFetch("https://jsr.io/@example/foo/meta.json", versionsResponse);

        mockCommand({
          command: Deno.execPath(),
          args: [
            "install",
            "--name=foo",
            "--global",
            "--force",
            "--quiet",
            "jsr:@example/foo@1.0.1",
          ],
          stdout: "piped",
          stderr: "piped",
        });

        await upgrade({
          name: "foo",
          from: "1.0.0",
          to: "latest",
          provider,
        });

        resetFetch();
        resetCommand();
      },
    });

    resetGlobalFetch();
    resetGlobalCommand();
  },
});

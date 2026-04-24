import { test } from "@cliffy/internal/testing/test";
import { assert, assertEquals } from "@std/assert";
import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import { upgrade } from "../upgrade.ts";
import { NestLandProvider } from "./nest_land.ts";
import {
  mockCommand,
  mockGlobalCommand,
  resetCommand,
  resetGlobalCommand,
} from "@c4spar/mock-command";

test({
  name: "NestLandProvider",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    mockGlobalFetch();
    mockGlobalCommand();

    const provider = new NestLandProvider({
      main: "foo.ts",
    });

    await ctx.step({
      name: "should return registry url",
      fn() {
        assertEquals(
          provider.getRegistryUrl("foo", "1.0.0"),
          "https://x.nest.land/foo@1.0.0",
        );
      },
    });

    await ctx.step({
      name: "should return repository url",
      fn() {
        assertEquals(
          provider.getRepositoryUrl("foo"),
          "https://nest.land/package/foo",
        );
      },
    });

    await ctx.step({
      name: "should return versions",
      async fn() {
        mockFetch("https://nest.land/api/package-client", {
          body: JSON.stringify({
            body: {
              latestVersion: "foo@1.0.1",
              packageUploadNames: ["foo@1.0.0", "foo@1.0.1"],
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
            body: {
              latestVersion: "foo@1.0.1",
              packageUploadNames: ["foo@1.0.0", "foo@1.0.1"],
            },
          }),
        };

        mockFetch("https://nest.land/api/package-client", mock);
        const isOutdated = await provider.isOutdated("foo", "1.0.0", "latest");
        assert(isOutdated);

        mockFetch("https://nest.land/api/package-client", mock);
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
            body: {
              latestVersion: "1.0.1",
              packageUploadNames: ["foo@1.0.0", "foo@1.0.1"],
            },
          }),
        };
        mockFetch("https://nest.land/api/package-client", versionsResponse);
        mockFetch("https://nest.land/api/package-client", versionsResponse);

        mockCommand({
          command: Deno.execPath(),
          args: [
            "install",
            "--name=foo",
            "--global",
            "--force",
            "--quiet",
            "https://x.nest.land/foo@1.0.1/foo.ts",
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

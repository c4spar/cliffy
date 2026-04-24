import { test } from "@cliffy/internal/testing/test";
import { assert, assertEquals } from "@std/assert";
import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import {
  mockCommand,
  mockGlobalCommand,
  resetCommand,
  resetGlobalCommand,
} from "@c4spar/mock-command";
import { DenoLandProvider } from "./deno_land.ts";
import type { Versions } from "../provider.ts";
import { upgrade } from "../upgrade.ts";

test({
  name: "DenoLandProvider",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    mockGlobalFetch();
    mockGlobalCommand();

    const provider = new DenoLandProvider({
      main: "foo.ts",
    });

    await ctx.step({
      name: "should return registry url",
      fn() {
        assertEquals(
          provider.getRegistryUrl("foo", "1.0.0"),
          "https://deno.land/x/foo@1.0.0",
        );
      },
    });

    await ctx.step({
      name: "should return repository url",
      fn() {
        assertEquals(
          provider.getRepositoryUrl("foo"),
          "https://deno.land/x/foo",
        );
      },
    });

    await ctx.step({
      name: "should return versions",
      async fn() {
        const expectedVersions: Versions = {
          latest: "1.0.1",
          versions: ["1.0.1", "1.0.0"],
        };

        mockFetch("https://cdn.deno.land/foo/meta/versions.json", {
          body: JSON.stringify(expectedVersions),
        });
        const versions = await provider.getVersions("foo");

        assertEquals(versions, expectedVersions);

        resetFetch();
      },
    });

    await ctx.step({
      name: "should check if version is outdated",
      async fn() {
        const mock = {
          body: JSON.stringify({
            latest: "1.0.1",
            versions: ["1.0.1", "1.0.0"],
          }),
        };

        mockFetch("https://cdn.deno.land/foo/meta/versions.json", mock);
        const isOutdated = await provider.isOutdated("foo", "1.0.0", "latest");
        assert(isOutdated);

        mockFetch("https://cdn.deno.land/foo/meta/versions.json", mock);
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
            versions: ["1.0.1", "1.0.0"],
          }),
        };
        mockFetch(
          "https://cdn.deno.land/foo/meta/versions.json",
          versionsResponse,
        );
        mockFetch(
          "https://cdn.deno.land/foo/meta/versions.json",
          versionsResponse,
        );

        mockCommand({
          command: Deno.execPath(),
          args: [
            "install",
            "--name=foo",
            "--global",
            "--force",
            "--quiet",
            "https://deno.land/x/foo@1.0.1/foo.ts",
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

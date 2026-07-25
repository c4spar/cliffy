import { test } from "@cliffy/internal/testing/test";
import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import { upgrade } from "../upgrade.ts";
import { AssetNotFoundError } from "../asset-not-found-error.ts";
import { GithubProvider } from "./github.ts";
import {
  mockCommand,
  mockGlobalCommand,
  resetCommand,
  resetGlobalCommand,
} from "@c4spar/mock-command";

test({
  name: "GithubProvider",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    mockGlobalFetch();
    mockGlobalCommand();

    const provider = new GithubProvider({ repository: "repo/user" });

    await ctx.step({
      name: "should return registry url",
      fn() {
        assertEquals(
          provider.getRegistryUrl("foo", "1.0.0"),
          "https://raw.githubusercontent.com/repo/user/1.0.0",
        );
      },
    });

    await ctx.step({
      name: "should return repository url",
      fn() {
        assertEquals(
          provider.getRepositoryUrl("foo"),
          "https://github.com/repo/user",
        );
      },
    });

    await ctx.step({
      name: "should return versions",
      async fn() {
        mockFetch("https://api.github.com/repos/repo/user/git/refs/tags", {
          body: JSON.stringify([
            { ref: "1.0.0" },
            { ref: "1.0.1" },
          ]),
        });
        mockFetch("https://api.github.com/repos/repo/user/branches", {
          body: JSON.stringify([
            { name: "branch-1", protected: true },
            { name: "branch-2", protected: false },
          ]),
        });
        const versions = await provider.getVersions("foo");

        assertEquals(versions, {
          latest: "1.0.1",
          versions: [
            "1.0.1",
            "1.0.0",
            "branch-1 (\x1b[1mProtected\x1b[22m)",
            "branch-2 ",
          ],
          tags: [
            "1.0.1",
            "1.0.0",
          ],
          branches: [
            "branch-1 (\x1b[1mProtected\x1b[22m)",
            "branch-2 ",
          ],
        });

        resetFetch();
      },
    });

    await ctx.step({
      name: "should list versions with non-semver branch names",
      async fn() {
        mockFetch("https://api.github.com/repos/repo/user/git/refs/tags", {
          body: JSON.stringify([{ ref: "1.0.0" }, { ref: "1.0.1" }]),
        });
        mockFetch("https://api.github.com/repos/repo/user/branches", {
          body: JSON.stringify([
            { name: "main", protected: false },
            { name: "condition", protected: false },
          ]),
        });

        const logs: Array<string> = [];
        const original = console.log;
        console.log = (...args: Array<unknown>) => {
          logs.push(args.map(String).join(" "));
        };
        try {
          await provider.listVersions("foo");
        } finally {
          console.log = original;
          resetFetch();
        }

        assert(logs.some((line) => line.includes("condition")));
        assert(logs.some((line) => line.includes("main")));
      },
    });

    await ctx.step({
      name: "should check if version is outdated",
      async fn() {
        const tagsMock = {
          body: JSON.stringify([
            { ref: "1.0.0" },
            { ref: "1.0.1" },
          ]),
        };
        const branchesMock = {
          body: JSON.stringify([
            { name: "branch-1", protected: true },
            { name: "branch-2", protected: false },
          ]),
        };

        mockFetch(
          "https://api.github.com/repos/repo/user/git/refs/tags",
          tagsMock,
        );
        mockFetch(
          "https://api.github.com/repos/repo/user/branches",
          branchesMock,
        );
        const isOutdated = await provider.isOutdated("foo", "1.0.0", "latest");
        assert(isOutdated);

        mockFetch(
          "https://api.github.com/repos/repo/user/git/refs/tags",
          tagsMock,
        );
        mockFetch(
          "https://api.github.com/repos/repo/user/branches",
          branchesMock,
        );
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
        const tagsResponse = {
          body: JSON.stringify([
            { ref: "1.0.0" },
            { ref: "1.0.1" },
          ]),
        };
        mockFetch(
          "https://api.github.com/repos/repo/user/git/refs/tags",
          tagsResponse,
        );
        mockFetch(
          "https://api.github.com/repos/repo/user/git/refs/tags",
          tagsResponse,
        );

        const branchesResponse = {
          body: JSON.stringify([
            { name: "branch-1", protected: true },
            { name: "branch-2", protected: false },
          ]),
        };
        mockFetch(
          "https://api.github.com/repos/repo/user/branches",
          branchesResponse,
        );
        mockFetch(
          "https://api.github.com/repos/repo/user/branches",
          branchesResponse,
        );

        mockCommand({
          command: Deno.execPath(),
          args: [
            "install",
            "--name=foo",
            "--global",
            "--force",
            "--quiet",
            "https://raw.githubusercontent.com/repo/user/1.0.1",
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

test({
  name: "GithubProvider binary mode",
  ignore: ["node", "bun"],
  fn: async (ctx) => {
    mockGlobalFetch();

    await ctx.step({
      name: "should not support binary upgrades without an asset config",
      fn() {
        const provider = new GithubProvider({ repository: "user/repo" });
        assertEquals(provider.supportsBinaryUpgrade, false);
      },
    });

    await ctx.step({
      name: "should support binary upgrades with an asset config",
      fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: { "darwin-x86_64": "cli-macos-amd64.tar.gz" },
        });
        assertEquals(provider.supportsBinaryUpgrade, true);
      },
    });

    await ctx.step({
      name: "should resolve the asset from an os-arch map",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: { "darwin-aarch64": "cli-macos-arm64.tar.gz" },
        });
        mockFetch(
          "https://api.github.com/repos/user/repo/releases/tags/1.0.0",
          {
            body: JSON.stringify({
              assets: [
                {
                  name: "cli-macos-arm64.tar.gz",
                  url:
                    "https://api.github.com/repos/user/repo/releases/assets/1",
                },
              ],
            }),
          },
        );
        const asset = await provider.getBinaryAsset({
          name: "cli",
          version: "1.0.0",
          os: "darwin",
          arch: "aarch64",
        });
        assertEquals(asset.name, "cli-macos-arm64.tar.gz");
        assertEquals(
          asset.url,
          "https://api.github.com/repos/user/repo/releases/assets/1",
        );
        resetFetch();
      },
    });

    await ctx.step({
      name: "should default the binary name to the cli name",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: { "darwin-aarch64": "cli-macos-arm64.tar.gz" },
        });
        mockFetch(
          "https://api.github.com/repos/user/repo/releases/tags/1.0.0",
          {
            body: JSON.stringify({
              assets: [
                {
                  name: "cli-macos-arm64.tar.gz",
                  url:
                    "https://api.github.com/repos/user/repo/releases/assets/1",
                },
              ],
            }),
          },
        );
        const asset = await provider.getBinaryAsset({
          name: "mycli",
          version: "1.0.0",
          os: "darwin",
          arch: "aarch64",
        });
        assertEquals(asset.binaryName, "mycli");
        resetFetch();
      },
    });

    await ctx.step({
      name: "should use the configured binary name",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          binaryName: "deno",
          asset: { "darwin-aarch64": "cli-macos-arm64.tar.gz" },
        });
        mockFetch(
          "https://api.github.com/repos/user/repo/releases/tags/1.0.0",
          {
            body: JSON.stringify({
              assets: [
                {
                  name: "cli-macos-arm64.tar.gz",
                  url:
                    "https://api.github.com/repos/user/repo/releases/assets/1",
                },
              ],
            }),
          },
        );
        const asset = await provider.getBinaryAsset({
          name: "mycli",
          version: "1.0.0",
          os: "darwin",
          arch: "aarch64",
        });
        assertEquals(asset.binaryName, "deno");
        resetFetch();
      },
    });

    await ctx.step({
      name: "should resolve the asset from a function",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: (ctx) => `cli-${ctx.os}-${ctx.arch}-${ctx.version}.gz`,
        });
        mockFetch(
          "https://api.github.com/repos/user/repo/releases/tags/2.1.0",
          {
            body: JSON.stringify({
              assets: [
                {
                  name: "cli-linux-x86_64-2.1.0.gz",
                  url:
                    "https://api.github.com/repos/user/repo/releases/assets/9",
                },
              ],
            }),
          },
        );
        const asset = await provider.getBinaryAsset({
          name: "cli",
          version: "2.1.0",
          os: "linux",
          arch: "x86_64",
        });
        assertEquals(asset.name, "cli-linux-x86_64-2.1.0.gz");
        resetFetch();
      },
    });

    await ctx.step({
      name: "should throw when no asset is configured for the target",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: { "darwin-x86_64": "cli.tar.gz" },
        });
        await assertRejects(
          () =>
            provider.getBinaryAsset({
              name: "cli",
              version: "1.0.0",
              os: "linux",
              arch: "aarch64",
            }),
          AssetNotFoundError,
          "linux-aarch64",
        );
      },
    });

    await ctx.step({
      name: "should throw when the asset is missing from the release",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: { "darwin-x86_64": "cli-macos-amd64.tar.gz" },
        });
        mockFetch(
          "https://api.github.com/repos/user/repo/releases/tags/1.0.0",
          {
            body: JSON.stringify({
              assets: [
                {
                  name: "cli-linux-amd64.tar.gz",
                  url:
                    "https://api.github.com/repos/user/repo/releases/assets/2",
                },
              ],
            }),
          },
        );
        await assertRejects(
          () =>
            provider.getBinaryAsset({
              name: "cli",
              version: "1.0.0",
              os: "darwin",
              arch: "x86_64",
            }),
          AssetNotFoundError,
          "cli-macos-amd64.tar.gz",
        );
        resetFetch();
      },
    });

    await ctx.step({
      name: "should send an auth header resolved from a token function",
      async fn() {
        const provider = new GithubProvider({
          repository: "user/repo",
          asset: { "darwin-x86_64": "cli.tar.gz" },
          token: () => "secret-token",
        });
        mockFetch(
          "https://api.github.com/repos/user/repo/releases/tags/1.0.0",
          {
            body: JSON.stringify({
              assets: [
                {
                  name: "cli.tar.gz",
                  url:
                    "https://api.github.com/repos/user/repo/releases/assets/3",
                },
              ],
            }),
          },
        );
        const asset = await provider.getBinaryAsset({
          name: "cli",
          version: "1.0.0",
          os: "darwin",
          arch: "x86_64",
        });
        assertEquals(
          new Headers(asset.headers).get("Authorization"),
          "token secret-token",
        );
        resetFetch();
      },
    });

    resetGlobalFetch();
  },
});

test({
  name: "GithubProvider.hasRequiredPermissions (cross-runtime)",
  fn: async () => {
    const provider = new GithubProvider({ repository: "user/repo" });
    assertEquals(typeof await provider.hasRequiredPermissions(), "boolean");
  },
});

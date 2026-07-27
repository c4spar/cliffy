import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
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
import { upgrade } from "../upgrade.ts";
import { AssetNotFoundError } from "../asset-not-found-error.ts";
import { GitlabProvider } from "./gitlab.ts";

const apiBase = "https://gitlab.com/api/v4/projects/group%2Fproject";

test({
  name: "GitlabProvider",
  ignore: ["node", "bun"],
  fn: async (t) => {
    mockGlobalFetch();
    mockGlobalCommand();

    await t.step({
      name: "should return the registry (raw) url",
      fn() {
        const provider = new GitlabProvider({ repository: "group/project" });
        assertEquals(
          provider.getRegistryUrl("cli", "1.0.0"),
          "https://gitlab.com/group/project/-/raw/1.0.0",
        );
      },
    });

    await t.step({
      name: "should return the repository url",
      fn() {
        const provider = new GitlabProvider({ repository: "group/project" });
        assertEquals(
          provider.getRepositoryUrl("cli"),
          "https://gitlab.com/group/project",
        );
      },
    });

    await t.step({
      name: "should honor a self-hosted host",
      fn() {
        const provider = new GitlabProvider({
          repository: "group/project",
          host: "https://gitlab.example.com/",
        });
        assertEquals(
          provider.getRegistryUrl("cli", "2.0.0"),
          "https://gitlab.example.com/group/project/-/raw/2.0.0",
        );
      },
    });

    await t.step({
      name: "should return versions (tags and branches)",
      async fn() {
        mockFetch(`${apiBase}/repository/tags`, {
          body: JSON.stringify([{ name: "1.0.1" }, { name: "1.0.0" }]),
        });
        mockFetch(`${apiBase}/repository/branches`, {
          body: JSON.stringify([
            { name: "main", protected: true },
            { name: "dev", protected: false },
          ]),
        });
        const provider = new GitlabProvider({ repository: "group/project" });
        const versions = await provider.getVersions("cli");
        assertEquals(versions.latest, "1.0.1");
        assertEquals(versions.tags, ["1.0.1", "1.0.0"]);
        assertEquals(versions.branches, ["dev", "main"]);
        assertEquals(versions.versions, ["1.0.1", "1.0.0", "dev", "main"]);
        resetFetch();
      },
    });

    await t.step({
      name: "should not support binary upgrades without an asset config",
      fn() {
        assertEquals(
          new GitlabProvider({ repository: "group/project" })
            .supportsBinaryUpgrade,
          false,
        );
      },
    });

    await t.step({
      name: "should resolve a binary asset with a PRIVATE-TOKEN header",
      async fn() {
        mockFetch(`${apiBase}/releases/1.0.0`, {
          body: JSON.stringify({
            assets: {
              links: [{
                name: "cli-linux-amd64.tar.gz",
                url: "https://gitlab.com/x/cli-linux-amd64.tar.gz",
              }],
            },
          }),
        });
        const provider = new GitlabProvider({
          repository: "group/project",
          asset: { "linux-x86_64": "cli-linux-amd64.tar.gz" },
          token: "secret",
        });
        const asset = await provider.getBinaryAsset({
          name: "cli",
          version: "1.0.0",
          os: "linux",
          arch: "x86_64",
        });
        assertEquals(asset.url, "https://gitlab.com/x/cli-linux-amd64.tar.gz");
        assertEquals(new Headers(asset.headers).get("PRIVATE-TOKEN"), "secret");
        resetFetch();
      },
    });

    await t.step({
      name: "should not send the Gitlab token to an external asset host",
      async fn() {
        mockFetch(`${apiBase}/releases/1.0.0`, {
          body: JSON.stringify({
            assets: {
              links: [{
                name: "cli-linux-amd64.tar.gz",
                url: "https://downloads.example.com/cli.tar.gz",
              }],
            },
          }),
        });
        const provider = new GitlabProvider({
          repository: "group/project",
          asset: { "linux-x86_64": "cli-linux-amd64.tar.gz" },
          token: "secret",
        });
        const asset = await provider.getBinaryAsset({
          name: "cli",
          version: "1.0.0",
          os: "linux",
          arch: "x86_64",
        });
        assertEquals(asset.url, "https://downloads.example.com/cli.tar.gz");
        assertEquals(new Headers(asset.headers).has("PRIVATE-TOKEN"), false);
        resetFetch();
      },
    });

    await t.step({
      name: "should throw when the asset link is missing",
      async fn() {
        mockFetch(`${apiBase}/releases/1.0.0`, {
          body: JSON.stringify({
            assets: { links: [{ name: "other.tar.gz", url: "https://x/o" }] },
          }),
        });
        const provider = new GitlabProvider({
          repository: "group/project",
          asset: { "linux-x86_64": "cli-linux-amd64.tar.gz" },
        });
        await assertRejects(
          () =>
            provider.getBinaryAsset({
              name: "cli",
              version: "1.0.0",
              os: "linux",
              arch: "x86_64",
            }),
          AssetNotFoundError,
          "cli-linux-amd64.tar.gz",
        );
        resetFetch();
      },
    });

    await t.step({
      name: "should upgrade as a script install from the raw url",
      ignore: ["node"],
      async fn() {
        const provider = new GitlabProvider({ repository: "group/project" });
        mockCommand({
          command: Deno.execPath(),
          args: [
            "install",
            "--name=cli",
            "--global",
            "--force",
            "--quiet",
            "https://gitlab.com/group/project/-/raw/1.0.0",
          ],
          stdout: "piped",
          stderr: "piped",
        });
        await upgrade({
          name: "cli",
          from: "0.9.0",
          to: "1.0.0",
          force: true,
          standalone: false,
          provider,
        });
        resetCommand();
      },
    });

    resetGlobalFetch();
    resetGlobalCommand();
  },
});

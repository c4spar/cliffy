import {
  mockFetch,
  mockGlobalFetch,
  resetFetch,
  resetGlobalFetch,
} from "@c4spar/mock-fetch";
import { snapshotTest } from "@cliffy/testing";
import { GithubProvider } from "./github.ts";

await snapshotTest({
  name: "should render GithubProvider listVersions output with branch metadata",
  meta: import.meta,
  colors: true,
  env: { FORCE_COLOR: "1" },
  async fn() {
    mockGlobalFetch();
    mockFetch("https://api.github.com/repos/repo/user/git/refs/tags", {
      body: JSON.stringify([{ ref: "1.0.0" }, { ref: "1.0.1" }]),
    });
    mockFetch("https://api.github.com/repos/repo/user/branches", {
      body: JSON.stringify([
        { name: "main", protected: true },
        { name: "condition", protected: false },
      ]),
    });

    try {
      const provider = new GithubProvider({ repository: "repo/user" });
      await provider.listVersions("foo");
    } finally {
      resetFetch();
      resetGlobalFetch();
    }
  },
});

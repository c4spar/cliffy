import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { Provider, type Versions } from "./provider.ts";
import { VersionNotFoundError } from "./version-not-found-error.ts";

test("Provider.isOutdated", async (ctx) => {
  await ctx.step("should suggest the version without a v prefix", async () => {
    const message = await messageFor(
      provider(["2.0.0", "1.2.0", "1.1.0"]),
      "v1.2.0",
    );

    assertStringIncludes(message, "The provided version v1.2.0 is not found.");
    assertStringIncludes(message, "Did you mean 1.2.0?");
  });

  await ctx.step("should suggest the version with a v prefix", async () => {
    const message = await messageFor(
      provider(["v2.0.0", "v1.2.0"]),
      "1.2.0",
    );

    assertStringIncludes(message, "Did you mean v1.2.0?");
  });

  await ctx.step("should not guess an unrelated version", async () => {
    const message = await messageFor(
      provider(["2.0.0", "1.2.0", "1.1.0"]),
      "1.2.5",
    );

    assertEquals(message.includes("Did you mean"), false);
  });

  await ctx.step(
    "should name the latest version when nothing is close",
    async () => {
      const message = await messageFor(
        provider(["1.2.1", "1.2.0", "1.1.0"]),
        "9.9.9",
      );

      assertStringIncludes(message, "The latest version is 1.2.1.");
      assertEquals(message.includes("Did you mean"), false);
    },
  );

  await ctx.step("should point at the full version list", async () => {
    const message = await messageFor(provider(["1.2.1"]), "9.9.9");

    assertStringIncludes(message, "--list-versions");
    assertStringIncludes(message, "https://example.com/repo");
  });

  await ctx.step("should add no hint when the registry is empty", async () => {
    const message = await messageFor(provider([], ""), "9.9.9");

    assertEquals(message.includes("Did you mean"), false);
    assertEquals(message.includes("The latest version is"), false);
  });
});

class TestProvider extends Provider {
  readonly name = "test";

  constructor(private readonly availableVersions: Versions) {
    super();
  }

  hasRequiredPermissions(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getVersions(): Promise<Versions> {
    return Promise.resolve(this.availableVersions);
  }

  getRepositoryUrl(): string {
    return "https://example.com/repo";
  }

  getRegistryUrl(): string {
    return "https://example.com/registry";
  }
}

function provider(versions: Array<string>, latest = versions[0]): Provider {
  return new TestProvider({ latest, versions });
}

async function messageFor(
  provider: Provider,
  targetVersion: string,
): Promise<string> {
  const error = await assertRejects(
    () => provider.isOutdated("cli", "0.9.0", targetVersion),
    VersionNotFoundError,
  );
  return stripAnsiCode(error.message);
}

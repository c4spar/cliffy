import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { resolveToken } from "./token.ts";

test({
  name: "resolveToken",
  ignore: ["node", "bun"],
  fn: async (t) => {
    await t.step({
      name: "should return an explicit string token",
      async fn() {
        assertEquals(await resolveToken("secret", ["TOKEN"]), "secret");
      },
    });

    await t.step({
      name: "should resolve a token from a function",
      async fn() {
        assertEquals(
          await resolveToken(() => Promise.resolve("fn-token"), ["TOKEN"]),
          "fn-token",
        );
      },
    });

    await t.step({
      name: "should fall back to the first set environment variable",
      async fn() {
        Deno.env.set("CLIFFY_TEST_TOKEN_B", "from-env");
        try {
          assertEquals(
            await resolveToken(undefined, [
              "CLIFFY_TEST_TOKEN_A",
              "CLIFFY_TEST_TOKEN_B",
            ]),
            "from-env",
          );
        } finally {
          Deno.env.delete("CLIFFY_TEST_TOKEN_B");
        }
      },
    });

    await t.step({
      name: "should prefer an explicit token over the environment",
      async fn() {
        Deno.env.set("CLIFFY_TEST_TOKEN_C", "from-env");
        try {
          assertEquals(
            await resolveToken("explicit", ["CLIFFY_TEST_TOKEN_C"]),
            "explicit",
          );
        } finally {
          Deno.env.delete("CLIFFY_TEST_TOKEN_C");
        }
      },
    });

    await t.step({
      name: "should return undefined when nothing resolves",
      async fn() {
        assertEquals(
          await resolveToken(undefined, ["CLIFFY_TEST_TOKEN_UNSET"]),
          undefined,
        );
      },
    });
  },
});

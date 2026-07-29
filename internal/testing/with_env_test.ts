import { assertEquals } from "@std/assert";
import { deleteEnv } from "../runtime/delete_env.ts";
import { getEnv } from "../runtime/get_env.ts";
import { setEnv } from "../runtime/set_env.ts";
import { test } from "./test/mod.ts";
import { withEnv } from "./with_env.ts";

const name = "CLIFFY_WITH_ENV_TEST";

test("should restore the previous value of an environment variable", async () => {
  setEnv(name, "previous");

  try {
    await withEnv({ [name]: "current" }, () => {
      assertEquals(getEnv(name), "current");
    })();

    assertEquals(getEnv(name), "previous");
  } finally {
    deleteEnv(name);
  }
});

test("should delete a previously unset environment variable", async () => {
  await withEnv({ [name]: "current" }, () => {
    assertEquals(getEnv(name), "current");
  })();

  assertEquals(getEnv(name), undefined);
});

test("should restore environment variables when the test function throws", async () => {
  let error: unknown;

  try {
    await withEnv({ [name]: "current" }, () => {
      throw new Error("expected");
    })();
  } catch (caughtError) {
    error = caughtError;
  }

  assertEquals(error instanceof Error ? error.message : undefined, "expected");
  assertEquals(getEnv(name), undefined);
});

test({
  name: "should set environment variables defined in the test options",
  env: { [name]: "current" },
  fn: () => {
    assertEquals(getEnv(name), "current");
  },
});

test("should restore environment variables defined in the test options", () => {
  assertEquals(getEnv(name), undefined);
});

import { assertEquals } from "@std/assert";
import { test } from "../testing/test/mod.ts";
import { deleteEnv } from "./delete_env.ts";
import { getEnv } from "./get_env.ts";
import { getNoColor } from "./no_color.ts";
import { setEnv } from "./set_env.ts";

test({
  name: "should recognize any non-empty NO_COLOR value on Node.js and Bun",
  ignore: ["deno"],
  fn: () => {
    withEnv({ NO_COLOR: "true", NODE_DISABLE_COLORS: "" }, () => {
      assertEquals(getNoColor(), true);
    });

    withEnv({ NO_COLOR: "", NODE_DISABLE_COLORS: "" }, () => {
      assertEquals(getNoColor(), false);
    });
  },
});

test({
  name:
    "should recognize any non-empty NODE_DISABLE_COLORS value on Node.js and Bun",
  ignore: ["deno"],
  fn: () => {
    withEnv({ NO_COLOR: "", NODE_DISABLE_COLORS: "true" }, () => {
      assertEquals(getNoColor(), true);
    });

    withEnv({ NO_COLOR: "", NODE_DISABLE_COLORS: "" }, () => {
      assertEquals(getNoColor(), false);
    });
  },
});

function withEnv(env: Record<string, string>, fn: () => void): void {
  const names = Object.keys(env);
  const previousValues: Record<string, string | undefined> = Object
    .fromEntries(names.map((name) => [name, getEnv(name)]));

  try {
    for (const name of names) {
      setEnv(name, env[name]);
    }
    fn();
  } finally {
    for (const name of names) {
      const previousValue = previousValues[name];

      if (previousValue === undefined) {
        deleteEnv(name);
      } else {
        setEnv(name, previousValue);
      }
    }
  }
}

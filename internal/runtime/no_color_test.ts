import { assertEquals } from "@std/assert";
import { test } from "../testing/test/mod.ts";
import { withEnv } from "../testing/with_env.ts";
import { getNoColor } from "./no_color.ts";

test({
  name:
    "should disable colors for a non-empty NO_COLOR value on Node.js and Bun",
  ignore: ["deno"],
  fn: withEnv({ NO_COLOR: "true", NODE_DISABLE_COLORS: "" }, () => {
    assertEquals(getNoColor(), true);
  }),
});

test({
  name:
    "should disable colors for a non-empty NODE_DISABLE_COLORS value on Node.js and Bun",
  ignore: ["deno"],
  fn: withEnv({ NO_COLOR: "", NODE_DISABLE_COLORS: "true" }, () => {
    assertEquals(getNoColor(), true);
  }),
});

test({
  name:
    "should not disable colors for empty NO_COLOR and NODE_DISABLE_COLORS values on Node.js and Bun",
  ignore: ["deno"],
  fn: withEnv({ NO_COLOR: "", NODE_DISABLE_COLORS: "" }, () => {
    assertEquals(getNoColor(), false);
  }),
});

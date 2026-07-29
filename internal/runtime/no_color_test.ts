import { assertEquals } from "@std/assert";
import { test } from "../testing/test/mod.ts";
import { getNoColor } from "./no_color.ts";

test({
  name:
    "should disable colors for a non-empty NO_COLOR value on Node.js and Bun",
  ignore: ["deno"],
  env: { NO_COLOR: "true", NODE_DISABLE_COLORS: "" },
  fn: () => {
    assertEquals(getNoColor(), true);
  },
});

test({
  name:
    "should disable colors for a non-empty NODE_DISABLE_COLORS value on Node.js and Bun",
  ignore: ["deno"],
  env: { NO_COLOR: "", NODE_DISABLE_COLORS: "true" },
  fn: () => {
    assertEquals(getNoColor(), true);
  },
});

test({
  name:
    "should not disable colors for empty NO_COLOR and NODE_DISABLE_COLORS values on Node.js and Bun",
  ignore: ["deno"],
  env: { NO_COLOR: "", NODE_DISABLE_COLORS: "" },
  fn: () => {
    assertEquals(getNoColor(), false);
  },
});

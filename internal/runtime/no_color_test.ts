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
    const noColor = getEnv("NO_COLOR");

    try {
      setEnv("NO_COLOR", "true");
      assertEquals(getNoColor(), true);

      setEnv("NO_COLOR", "");
      assertEquals(getNoColor(), false);
    } finally {
      if (noColor === undefined) {
        deleteEnv("NO_COLOR");
      } else {
        setEnv("NO_COLOR", noColor);
      }
    }
  },
});

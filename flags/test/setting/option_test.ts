import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { FlagOptions } from "../../types.ts";

test("flags option callback", () => {
  const options: Array<{ option: FlagOptions; value: unknown }> = [];
  parseFlags([
    "--foo",
    "fooVal",
    "--bar",
    "barVal",
    "--baz",
    "bazVal",
  ], {
    flags: [{
      name: "foo",
      type: "string",
    }, {
      name: "bar",
      type: "string",
    }, {
      name: "baz",
      type: "string",
    }],
    option: (option, value) => {
      options.push({ option, value });
    },
  });

  assertEquals(options.length, 3);
  assertEquals(options[0].option.name, "foo");
  assertEquals(options[0].value, "fooVal");
  assertEquals(options[1].option.name, "bar");
  assertEquals(options[1].value, "barVal");
  assertEquals(options[2].option.name, "baz");
  assertEquals(options[2].value, "bazVal");
});

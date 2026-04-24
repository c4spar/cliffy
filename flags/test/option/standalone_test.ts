import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  flags: [{
    name: "flag",
    aliases: ["f"],
    standalone: true,
  }, {
    name: "all",
    aliases: ["a"],
  }, {
    name: "foo-bar",
    aliases: ["f"],
    type: "number",
    default: 3,
  }],
};

test("flags optionStandalone flag", () => {
  const { flags, unknown, literal } = parseFlags(["-f"], options);

  assertEquals(flags, { flag: true, fooBar: 3 });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionStandalone flagCombine", () => {
  assertThrows(
    () => parseFlags(["-f", "-a"], options),
    Error,
    `Option "--flag" cannot be combined with other options.`,
  );
});

test("flags optionStandalone flagCombineLong", () => {
  assertThrows(
    () => parseFlags(["--flag", "--all"], options),
    Error,
    `Option "--flag" cannot be combined with other options.`,
  );
});

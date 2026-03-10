import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  flags: [{
    name: "flag",
    aliases: ["f"],
  }],
};

test("flags - type - no value - short flag without argument", () => {
  const { flags, unknown, literal } = parseFlags(["-f"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - no value - long flag without argument", () => {
  const { flags, unknown, literal } = parseFlags(["--flag"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - no value - short flag with argument", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "true"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, ["true"]);
  assertEquals(literal, []);
});

test("flags - type - no value - long flag with argument", () => {
  const { flags, unknown, literal } = parseFlags(["--flag", "true"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, ["true"]);
  assertEquals(literal, []);
});

test("flags - type - no value - should throw if a no value flag has a value", () => {
  assertThrows(
    () => parseFlags(["-f=123"], options),
    Error,
    `Option "--flag" doesn't take a value, but got "123".`,
  );
});

test("flags - type - no value - should not throw unexpected error value with no options", () => {
  const result = parseFlags(["-f=123"]);
  assertEquals(result, {
    unknown: [],
    flags: { f: "123" },
    literal: [],
    stopEarly: false,
    stopOnUnknown: false,
    defaults: {},
    parsedFlags: ["-f=123"],
  });
});

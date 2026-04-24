import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const optionalValueOptions: ParseFlagsOptions = {
  stopEarly: false,
  allowEmpty: false,
  flags: [{
    name: "flag",
    aliases: ["f"],
    type: "integer",
    optionalValue: true,
  }],
};

const requiredValueOptions: ParseFlagsOptions = {
  stopEarly: false,
  allowEmpty: false,
  flags: [{
    name: "flag",
    aliases: ["f"],
    type: "integer",
  }],
};

test("flags - type - integer - with no value", () => {
  const { flags, unknown, literal } = parseFlags(["-f"], optionalValueOptions);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - integer - with valid value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag", "123"],
    optionalValueOptions,
  );

  assertEquals(flags, { flag: 123 });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - integer - with argument", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "456", "unknown"],
    optionalValueOptions,
  );

  assertEquals(flags, { flag: 456 });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - integer - with missing value", () => {
  assertThrows(
    () => parseFlags(["-f"], requiredValueOptions),
    Error,
    `Missing value for option "--flag".`,
  );
});

test("flags - type - integer - with invalid string value", () => {
  assertThrows(
    () => parseFlags(["-f", "abc"], requiredValueOptions),
    Error,
    `Option "--flag" must be of type "integer", but got "abc".`,
  );
});

test("flags - type - integer - with invalid float value", () => {
  assertThrows(
    () => parseFlags(["-f", "1.23"], requiredValueOptions),
    Error,
    `Option "--flag" must be of type "integer", but got "1.23".`,
  );
});

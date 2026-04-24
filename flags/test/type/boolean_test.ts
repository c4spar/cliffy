import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  stopEarly: false,
  allowEmpty: false,
  flags: [{
    name: "flag",
    aliases: ["f"],
    type: "boolean",
    optionalValue: true,
    standalone: true,
  }, {
    name: "no-flag",
  }],
};

test("flags - type - boolean - with no value", () => {
  const { flags, unknown, literal } = parseFlags(["-f"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - long flag with no value", () => {
  const { flags, unknown, literal } = parseFlags(["--flag"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - with true value", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "true"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - long flag with true value", () => {
  const { flags, unknown, literal } = parseFlags(["--flag", "true"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - with false value", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "false"], options);

  assertEquals(flags, { flag: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - long flag with false value and argument", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag", "false", "unknown"],
    options,
  );

  assertEquals(flags, { flag: false });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - boolean - with 1 value", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "1"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - long flag with 1 value", () => {
  const { flags, unknown, literal } = parseFlags(["--flag", "1"], options);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - with 0 value", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "0"], options);

  assertEquals(flags, { flag: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - boolean - long flag with 0 value and argument", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag", "0", "unknown"],
    options,
  );

  assertEquals(flags, { flag: false });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - boolean - negatable option with argument", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--no-flag", "unknown"],
    options,
  );

  assertEquals(flags, { flag: false });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - boolean - no value option with default value", () => {
  const parseOptions = {
    flags: [{
      name: "foo",
      default: false,
    }],
  };

  const result1 = parseFlags([], parseOptions);
  assertEquals(result1.flags, { foo: false });

  const result2 = parseFlags(["--foo"], parseOptions);
  assertEquals(result2.flags, { foo: true });
});

test("flags - type - boolean - with invalid value", () => {
  assertThrows(
    () => parseFlags(["-f", "unknown"], options),
    Error,
    `Option "--flag" must be of type "boolean", but got "unknown".` +
      ` Expected values: "true", "false", "1", "0"`,
  );
});

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
    type: "string",
    optionalValue: true,
  }],
};

const requiredStringValueOptions: ParseFlagsOptions = {
  stopEarly: false,
  allowEmpty: false,
  flags: [{
    name: "flag",
    aliases: ["f"],
    type: "string",
  }],
};

const requiredNumberValueOptions: ParseFlagsOptions = {
  stopEarly: false,
  allowEmpty: false,
  flags: [{
    name: "flag",
    aliases: ["f"],
    type: "number",
  }],
};

test("flags - type - string - with no value", () => {
  const { flags, unknown, literal } = parseFlags(["-f"], optionalValueOptions);

  assertEquals(flags, { flag: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - string - with valid value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag", "value"],
    optionalValueOptions,
  );

  assertEquals(flags, { flag: "value" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - type - string - with special chars", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", '!"§$%&/()=?*+#=\\/@*-+,<😎>,.;:_-abc123€√', "unknown"],
    optionalValueOptions,
  );

  assertEquals(flags, { flag: '!"§$%&/()=?*+#=\\/@*-+,<😎>,.;:_-abc123€√' });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with missing value", () => {
  assertThrows(
    () => parseFlags(["-f"], requiredStringValueOptions),
    Error,
    `Missing value for option "--flag".`,
  );
});

test("flags - type - string - value starting with '-'", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-a", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "-a" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with negative numeric value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-1", "unknown"],
    requiredNumberValueOptions,
  );

  assertEquals(flags, { flag: -1 });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with negative numeric value 2", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-123", "unknown"],
    requiredNumberValueOptions,
  );

  assertEquals(flags, { flag: -123 });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with negative decimal value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-12.2", "unknown"],
    requiredNumberValueOptions,
  );

  assertEquals(flags, { flag: -12.2 });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with negative numeric string value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-1", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "-1" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - value starting with hyphen", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-foo", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "-foo" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with long flag as value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "--foo", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "--foo" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with long flag and value as value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "--foo=bar", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "--foo=bar" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with short flag and value as value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-a=b", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "-a=b" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

test("flags - type - string - with only hyphens as value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-f", "-------------", "unknown"],
    requiredStringValueOptions,
  );

  assertEquals(flags, { flag: "-------------" });
  assertEquals(unknown, ["unknown"]);
  assertEquals(literal, []);
});

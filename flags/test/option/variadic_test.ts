import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  allowEmpty: false,
  flags: [{
    name: "optional",
    aliases: ["o"],
    type: "number",
    variadic: true,
    optionalValue: true,
  }, {
    name: "boolean",
    aliases: ["b"],
    type: "boolean",
    variadic: true,
  }, {
    name: "string",
    aliases: ["s"],
    type: "string",
    variadic: true,
  }, {
    name: "number",
    aliases: ["n"],
    type: "number",
    variadic: true,
  }, {
    name: "variadic-option",
    aliases: ["e"],
    args: [{
      type: "number",
    }, {
      type: "string",
      optional: false,
    }, {
      type: "string",
      optional: true,
    }, {
      type: "boolean",
      optional: true,
      variadic: true,
    }],
  }],
};

// Optional:

test("flags optionVariadic optional", () => {
  const { flags, unknown, literal } = parseFlags(["-o"], options);

  assertEquals(flags, { optional: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

// Boolean:

test("flags optionVariadic boolean", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-b", "1", "0", "true", "false"],
    options,
  );

  assertEquals(flags, { boolean: [true, false, true, false] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionVariadic booleanInvalidValue", () => {
  assertThrows(
    () => parseFlags(["-b", "1", "0", "true", "false", "2"], options),
    Error,
    `Option "--boolean" must be of type "boolean", but got "2".`,
  );
});

// String:

test("flags optionVariadic string", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-s", "1", "0", "true", "false"],
    options,
  );

  assertEquals(flags, { string: ["1", "0", "true", "false"] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

// Number:

test("flags optionVariadic number", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-n", "1", "0", "654", "1.2"],
    options,
  );

  assertEquals(flags, { number: [1, 0, 654, 1.2] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionVariadic numberInvalidValue", () => {
  assertThrows(
    () => parseFlags(["-n", "1", "0", "654", "abc", "1,2"], options),
    Error,
    `Option "--number" must be of type "number", but got "abc".`,
  );
});

// Exact:

test("flags optionVariadic arg1 + arg2", () => {
  const { flags, unknown, literal } = parseFlags(["-e", "1", "abc"], options);

  assertEquals(flags, { variadicOption: [1, "abc"] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionVariadic arg1 + arg2 + arg3", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-e", "1", "abc", "def", "1", "true"],
    options,
  );

  assertEquals(flags, { variadicOption: [1, "abc", "def", true, true] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionVariadic exactInvalidValue", () => {
  assertThrows(
    () => parseFlags(["-e", "abc", "def", "ghi", "1"], options),
    Error,
    `Option "--variadic-option" must be of type "number", but got "abc".`,
  );
});

test("flags optionVariadic exactMissingValue", () => {
  assertThrows(
    () => parseFlags(["-e", "1"], options),
    Error,
    `Missing value for option "--variadic-option".`,
  );
});

test("flags optionVariadic exactLastOptional", () => {
  const { flags, unknown, literal } = parseFlags(["-e", "1", "abc"], options);

  assertEquals(flags, { variadicOption: [1, "abc"] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionVariadic exactLastOptionalVariadic", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-e", "1", "abc", "def", "1", "0", "true", "false"],
    options,
  );

  assertEquals(
    flags,
    { variadicOption: [1, "abc", "def", true, false, true, false] },
  );
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("should allow passing an option after an variadic option", () => {
  const { flags, unknown, literal } = parseFlags([
    "-e",
    "1",
    "abc",
    "-s",
    "string value",
  ], {
    flags: [{
      name: "variadic-option",
      type: "string",
      aliases: ["e"],
      variadic: true,
    }, {
      name: "string",
      aliases: ["s"],
      type: "string",
    }],
  });

  assertEquals(flags, {
    variadicOption: ["1", "abc"],
    string: "string value",
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

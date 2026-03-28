import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  allowEmpty: true,
  flags: [{
    name: "boolean",
    aliases: ["b"],
    type: "boolean",
    optionalValue: true,
    default: false,
  }, {
    name: "string",
    aliases: ["s"],
    type: "string",
    default: "0",
  }, {
    name: "number",
    aliases: ["n"],
    type: "number",
    default: 0,
  }, {
    name: "boolean2",
    aliases: ["B"],
    type: "boolean",
    optionalValue: true,
    default: true,
  }, {
    name: "string2",
    aliases: ["S"],
    type: "string",
    default: "1",
  }, {
    name: "number2",
    aliases: ["N"],
    type: "number",
    default: 1,
  }, {
    name: "method",
    aliases: ["m"],
    type: "number",
    default: () => 1,
  }],
};

test("[flags] should set default args with empty arguments", () => {
  const { flags, unknown, literal } = parseFlags([], options);

  assertEquals(flags, {
    boolean: false,
    string: "0",
    number: 0,
    boolean2: true,
    string2: "1",
    number2: 1,
    method: 1,
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should override default values", () => {
  const { flags, unknown, literal } = parseFlags(
    [
      "-b",
      "1",
      "-s",
      "1",
      "-n",
      "1",
      "-B",
      "0",
      "-S",
      "0",
      "-N",
      "0",
      "-m",
      "0",
    ],
    options,
  );

  assertEquals(flags, {
    boolean: true,
    string: "1",
    number: 1,
    boolean2: false,
    string2: "0",
    number2: 0,
    method: 0,
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should override default value with optional value", () => {
  const { flags, unknown, literal } = parseFlags(["-b"], options);

  assertEquals(flags, {
    boolean: true,
    string: "0",
    number: 0,
    boolean2: true,
    string2: "1",
    number2: 1,
    method: 1,
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should ignore defaults", () => {
  const { flags, unknown, literal } = parseFlags([], {
    ...options,
    ignoreDefaults: {
      boolean: true,
      number: 0,
      string2: "foo",
    },
  });

  assertEquals(flags, {
    string: "0",
    boolean2: true,
    number2: 1,
    method: 1,
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should parse from context", () => {
  const { flags, unknown, literal } = parseFlags({
    flags: { bar: true },
    unknown: ["--foo"],
    literal: [],
    stopEarly: false,
    stopOnUnknown: false,
    defaults: {},
    parsedFlags: [],
  }, {
    ...options,
    flags: [
      { name: "foo" },
    ],
  });

  assertEquals(flags, {
    foo: true,
    bar: true,
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should ignore missing required options which are already parsed", () => {
  const { flags, unknown, literal } = parseFlags({
    flags: {
      required: true,
      boolean: true,
    },
    unknown: [],
    literal: [],
    stopEarly: false,
    stopOnUnknown: false,
    defaults: {},
    parsedFlags: [],
  }, {
    ...options,
    flags: [
      {
        name: "required",
        required: true,
      },
    ],
  });

  assertEquals(flags, {
    required: true,
    boolean: true,
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

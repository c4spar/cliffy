import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  flags: [{
    name: "required",
    type: "string",
    required: true,
  }, {
    name: "required-value",
    type: "string",
  }, {
    name: "required-default",
    type: "string",
    default: "default",
  }],
};

test("flags - option - required - required option", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--required", "foo"],
    options,
  );

  assertEquals(flags, { required: "foo", requiredDefault: "default" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - required - missing required option", () => {
  assertThrows(
    () => parseFlags([], options),
    Error,
    `Missing required option "--required".`,
  );
});

test("flags - option - required - required option value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--required", "foo", "--required-value", "bar"],
    options,
  );

  assertEquals(flags, {
    required: "foo",
    requiredDefault: "default",
    requiredValue: "bar",
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - required - missing required option value", () => {
  assertThrows(
    () => parseFlags(["--required", "foo", "--required-value"], options),
    Error,
    `Missing value for option "--required-value".`,
  );
});

test("flags - option - required - required option value with default value", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--required", "foo", "--required-default", "baz"],
    options,
  );

  assertEquals(flags, { required: "foo", requiredDefault: "baz" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - required - missing required option value with default value", () => {
  assertThrows(
    () => parseFlags(["--required", "foo", "--required-default"], options),
    Error,
    `Missing value for option "--required-default".`,
  );
});

import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";

test("should parse flags with multiple args", () => {
  const { flags, unknown, literal } = parseFlags([
    "--multi-arg-option",
    "123",
    "foo",
    "bar",
    "true",
  ], {
    flags: [{
      name: "multi-arg-option",
      aliases: ["m"],
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
      }],
    }],
  });

  assertEquals(flags, {
    multiArgOption: [123, "foo", "bar", true],
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("should set default values for flags with multiple args", () => {
  const { flags, unknown, literal } = parseFlags([], {
    flags: [{
      name: "multi-arg-option",
      aliases: ["m"],
      args: [{
        type: "number",
        default: 123,
      }, {
        type: "string",
        optional: false,
        default: "foo",
      }, {
        type: "string",
        optional: true,
        default: "bar",
      }, {
        type: "string",
        optional: true,
      }, {
        type: "boolean",
        optional: true,
        default: true,
      }],
    }],
  });

  assertEquals(flags, {
    multiArgOption: [123, "foo", "bar", undefined, true],
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("should set default values for flags with multiple args and omit trailing undefined values", () => {
  const { flags, unknown, literal } = parseFlags([], {
    flags: [{
      name: "multi-arg-option",
      aliases: ["m"],
      args: [{
        type: "number",
        default: 123,
      }, {
        type: "string",
        optional: false,
        default: "foo",
      }, {
        type: "string",
        optional: true,
        default: "bar",
      }, {
        type: "string",
        optional: true,
      }, {
        type: "boolean",
        optional: true,
      }],
    }],
  });

  assertEquals(flags, {
    multiArgOption: [123, "foo", "bar"],
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("should apply value handler for single-arg flag", () => {
  const { flags, unknown, literal } = parseFlags(["--count", "5"], {
    flags: [{
      name: "count",
      args: [{
        type: "number",
        value: (value) => value * 2,
      }],
    }],
  });

  assertEquals(flags, { count: 10 });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("should call default function for multi-arg flag", () => {
  const { flags, unknown, literal } = parseFlags([], {
    flags: [{
      name: "range",
      args: [{
        type: "number",
        default: () => 1,
      }, {
        type: "number",
        default: () => 100,
      }],
    }],
  });

  assertEquals(flags, { range: [1, 100] });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("should call value handlers for flags with multiple args", () => {
  const { flags, unknown, literal } = parseFlags([
    "--multi-arg-option",
    "123",
    "foo",
    "bar",
    "true",
  ], {
    flags: [{
      name: "multi-arg-option",
      aliases: ["m"],
      args: [{
        type: "number",
        value: (value) => value * 2,
      }, {
        type: "string",
        optional: false,
        value: (value) => value.toUpperCase(),
      }, {
        type: "string",
        optional: true,
        value: (value) => value.toUpperCase(),
      }, {
        type: "boolean",
        optional: true,
        value: (value) => `value: ${value}`,
      }],
    }],
  });

  assertEquals(flags, {
    multiArgOption: [246, "FOO", "BAR", "value: true"],
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

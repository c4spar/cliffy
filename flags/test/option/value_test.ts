import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  flags: [{
    name: "function",
    aliases: ["f"],
    type: "string",
    optionalValue: true,
    collect: true,
    value(
      value: string,
      previous: Array<string> = [],
    ): Array<string> | undefined {
      if (typeof value === "boolean") {
        return value;
      } else if (["foo", "bar", "baz"].includes(value)) {
        return [...previous, value];
      }
      throw new Error("invalid value");
    },
  }, {
    name: "incremental",
    aliases: ["i"],
    collect: true,
    value: (val: boolean, previous = 0) => val ? previous + 1 : 0,
  }, {
    name: "boolean",
    aliases: ["b"],
    collect: true,
  }, {
    name: "default",
    aliases: ["d"],
    default: "foo",
    value: (value) => value === "foo" ? "bar" : "baz",
  }],
};

test("flags - option - value - collect boolean", () => {
  const { flags, unknown, literal } = parseFlags(["-bbb"], options);

  assertEquals(flags, { boolean: [true, true, true], default: "bar" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - value - function validator with no value", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "-d"], options);

  assertEquals(flags, { function: true, default: "bar" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - value - function validator with valid value", () => {
  const { flags, unknown, literal } = parseFlags(["-f", "foo", "-d"], options);

  assertEquals(flags, { function: ["foo"], default: "bar" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - value - function validator with collected values", () => {
  const { flags, unknown, literal } = parseFlags([
    "-f",
    "foo",
    "-f",
    "bar",
    "-f",
    "baz",
    "-d",
  ], options);

  assertEquals(flags, { function: ["foo", "bar", "baz"], default: "bar" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags - option - value - function validator with invalid value", () => {
  assertThrows(
    () => parseFlags(["-f", "fo", "-d"], options),
    Error,
    `invalid value`,
  );
});

test("flags - option - value - function validator with incremental value", () => {
  const { flags } = parseFlags(["-iii"], options);
  assertEquals(flags, { incremental: 3, default: "bar" });
});

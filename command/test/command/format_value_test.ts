import { assertEquals } from "@std/assert";
import { test } from "@cliffy/internal/testing/test";
import { withColors } from "@cliffy/internal/testing/with-colors";
import { formatValue } from "../../help/format_value.ts";

class Foo {
  bar = 1;
}

const values: Array<[string, unknown, string]> = [
  ["a string", "beep", `"beep"`],
  ["a string with a quote", 'a"b', `"a\\"b"`],
  ["a string with a line break", "a\nb", `"a\\nb"`],
  ["an empty string", "", `""`],
  ["a number", 2, "2"],
  ["a negative zero", -0, "0"],
  ["a not a number value", NaN, "NaN"],
  ["an infinite number", Infinity, "Infinity"],
  ["a big int", 10n, "10"],
  ["a boolean", true, "true"],
  ["a null value", null, "null"],
  ["an undefined value", undefined, "undefined"],
  ["a date", new Date(0), "1970-01-01T00:00:00.000Z"],
  ["an invalid date", new Date(NaN), "Invalid Date"],
  ["a regular expression", /re/g, "/re/g"],
  ["an array", ["a", 1], `[ "a", 1 ]`],
  ["an empty array", [], "[]"],
  ["a nested array", [["a"]], `[ [ "a" ] ]`],
  ["a deeply nested array", [[["a"]]], "[ [ [...] ] ]"],
  ["an object", { a: "x", b: 2 }, "[Object]"],
  ["an empty object", {}, "[Object]"],
  ["an object without a prototype", Object.create(null), "[Object]"],
  ["an array of objects", [{ a: 1 }], "[ [Object] ]"],
  ["a map", new Map([["a", 1]]), "[Map]"],
  ["a set", new Set([1, 2]), "[Set]"],
  ["a class instance", new Foo(), "[Foo]"],
  ["a function", () => {}, "[Function]"],
  ["a class", Foo, "[Function]"],
  ["a symbol", Symbol("s"), "[Symbol]"],
];

for (const [description, value, expected] of values) {
  test(
    `should format ${description}`,
    withColors(false, () => {
      assertEquals(formatValue(value), expected);
    }),
  );
}

test(
  "should keep long values on a single line",
  withColors(false, () => {
    const value = ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc", "dddddddddd"];

    assertEquals(
      formatValue(value),
      `[ "aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc", "dddddddddd" ]`,
    );
  }),
);

test(
  "should cut off arrays after 10 items",
  withColors(false, () => {
    const value = Array.from({ length: 12 }, (_, index) => index);

    assertEquals(
      formatValue(value),
      "[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ... 2 more ]",
    );
  }),
);

test(
  "should colorize values when colors are enabled",
  withColors(true, () => {
    assertEquals(formatValue("beep"), '\x1b[32m"beep"\x1b[39m');
    assertEquals(formatValue(2), "\x1b[33m2\x1b[39m");
    assertEquals(formatValue(10n), "\x1b[33m10\x1b[39m");
    assertEquals(formatValue(true), "\x1b[33mtrue\x1b[39m");
    assertEquals(formatValue(null), "\x1b[90mnull\x1b[39m");
    assertEquals(formatValue(undefined), "\x1b[90mundefined\x1b[39m");
    assertEquals(
      formatValue(new Date(0)),
      "\x1b[35m1970-01-01T00:00:00.000Z\x1b[39m",
    );
    assertEquals(formatValue(/re/g), "\x1b[31m/re/g\x1b[39m");
    assertEquals(formatValue(new Map()), "\x1b[36m[Map]\x1b[39m");
    assertEquals(formatValue({ a: 1 }), "\x1b[36m[Object]\x1b[39m");
    assertEquals(
      formatValue(["x", 1, null]),
      `[ \x1b[32m"x"\x1b[39m, \x1b[33m1\x1b[39m, \x1b[90mnull\x1b[39m ]`,
    );
    assertEquals(
      formatValue([[["a"]]]),
      `[ [ \x1b[36m[...]\x1b[39m ] ]`,
    );
  }),
);

test(
  "should not colorize values when colors are disabled",
  withColors(false, () => {
    assertEquals(formatValue(["x", 1, null]), `[ "x", 1, null ]`);
  }),
);

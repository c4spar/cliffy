import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";

test("[flags] should skip optional arguments with an empty value", () => {
  const { flags, unknown, literal } = parseFlags(
    [
      "--foo",
      "",
      "--bar",
      "",
      "--baz",
      "",
      "--boop",
      "1",
      "--beep",
      "",
      "--beep",
      "beep-value-2",
      "--beep",
      "",
      "--beep",
      "beep-value-4",
      "--multi",
      "",
      "multi-value-2",
      "",
      "--variadic",
      "",
      "variadic-value-2",
      "",
      "variadic-value-4",
      "",
    ],
    {
      flags: [{
        name: "foo",
        type: "number",
        optionalValue: true,
      }, {
        name: "bar",
        type: "boolean",
      }, {
        name: "baz",
        type: "string",
      }, {
        name: "beep",
        type: "string",
        collect: true,
      }, {
        name: "boop",
        type: "number",
      }, {
        name: "multi",
        args: [{
          type: "string",
          optional: true,
        }, {
          type: "string",
          optional: true,
        }, {
          type: "string",
          optional: true,
        }],
      }, {
        name: "variadic",
        type: "string",
        optional: true,
        variadic: true,
      }],
    },
  );

  assertEquals(flags, {
    beep: [
      "beep-value-2",
      "beep-value-4",
    ],
    boop: 1,
    multi: [
      undefined,
      "multi-value-2",
      undefined,
    ],
    variadic: [
      "variadic-value-2",
      "variadic-value-4",
    ],
  });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

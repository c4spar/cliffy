import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
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

test("[flags] should skip required arguments with an empty value", () => {
  const { flags, unknown, literal } = parseFlags(["--foo", ""], {
    flags: [{
      name: "foo",
      type: "string",
    }],
  });

  assertEquals(flags, {});
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should throw if a required option has an empty value", () => {
  assertThrows(
    () =>
      parseFlags(["--foo", ""], {
        flags: [{
          name: "foo",
          type: "string",
          required: true,
        }],
      }),
    Error,
    `Missing value for option "--foo".`,
  );
});

test("[flags] should throw if a required option has an empty value with an equals sign", () => {
  assertThrows(
    () =>
      parseFlags(["--foo="], {
        flags: [{
          name: "foo",
          type: "string",
          required: true,
        }],
      }),
    Error,
    `Missing value for option "--foo".`,
  );
});

test("[flags] should throw if a required option with a default value has an empty value", () => {
  assertThrows(
    () =>
      parseFlags(["--foo", ""], {
        flags: [{
          name: "foo",
          type: "string",
          required: true,
          default: "default",
        }],
      }),
    Error,
    `Missing value for option "--foo".`,
  );
});

test("[flags] should throw if a required variadic option has an empty value", () => {
  assertThrows(
    () =>
      parseFlags(["--foo="], {
        flags: [{
          name: "foo",
          type: "string",
          variadic: true,
          required: true,
        }],
      }),
    Error,
    `Missing value for option "--foo".`,
  );
});

test("[flags] should skip apply the default value for an option with an optional argument and an empty value", () => {
  const { flags, unknown, literal } = parseFlags(["--foo", ""], {
    flags: [{
      name: "foo",
      type: "string",
      optionalValue: true,
      required: true,
      default: "default",
    }],
  });

  assertEquals(flags, { foo: "default" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

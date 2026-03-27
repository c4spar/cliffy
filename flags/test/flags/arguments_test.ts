import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import { assertThrows } from "@std/assert/throws";

test("should allow leading dash in args", () => {
  const { flags, args } = parseFlags(["--foo", "bar", "-baz"], {
    flags: [{
      name: "foo",
      aliases: ["f"],
      type: "string",
    }],
    args: [{
      type: "string",
    }],
  });

  assertEquals(flags, { foo: "bar" });
  assertEquals(args, ["-baz"]);
});

test("should allow leading double dash in args", () => {
  const { flags, args } = parseFlags(["--foo", "bar", "--baz"], {
    flags: [{
      name: "foo",
      aliases: ["f"],
      type: "string",
    }],
    args: [{
      type: "string",
    }],
  });

  assertEquals(flags, { foo: "bar" });
  assertEquals(args, ["--baz"]);
});

test("should throw an error for missing arguments", () => {
  assertThrows(
    () => {
      parseFlags(["--foo", "bar"], {
        flags: [{
          name: "foo",
          aliases: ["f"],
          type: "string",
        }],
        args: [{ type: "string" }],
      });
    },
    Error,
    "Missing argument(s): arg[0]",
  );
});

test("should throw an error for missing arguments with name", () => {
  assertThrows(
    () => {
      parseFlags(["--foo", "bar"], {
        flags: [{
          name: "foo",
          aliases: ["f"],
          type: "string",
        }],
        args: [{ type: "string", name: "arg1" }],
      });
    },
    Error,
    "Missing argument(s): arg1",
  );
});

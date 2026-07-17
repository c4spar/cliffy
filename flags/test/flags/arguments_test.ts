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

test("should use falsy default value 0 for positional arg", () => {
  const { args } = parseFlags([], {
    args: [{ type: "number", default: 0 }],
  });
  assertEquals(args, [0]);
});

test("should use falsy default value false for positional arg", () => {
  const { args } = parseFlags([], {
    args: [{ type: "boolean", default: false }],
  });
  assertEquals(args, [false]);
});

test('should use falsy default value "" for positional arg', () => {
  const { args } = parseFlags([], {
    args: [{ type: "string", default: "" }],
  });
  assertEquals(args, [""]);
});

test("should call default function for positional arg", () => {
  const { args } = parseFlags([], {
    args: [{ type: "string", default: () => "foo" }],
  });
  assertEquals(args, ["foo"]);
});

test("should parse positional args without flags definition", () => {
  const { args, flags, unknown } = parseFlags(["hello", "42"], {
    args: [{ type: "string" }, { type: "number" }],
  });
  assertEquals(args, ["hello", 42]);
  assertEquals(flags, {});
  assertEquals(unknown, []);
});

test("should parse variadic positional arg", () => {
  const { flags, args } = parseFlags(["--count", "3", "a", "b", "c"], {
    flags: [{ name: "count", type: "string" }],
    args: [{ type: "string", variadic: true }],
  });
  assertEquals(flags, { count: "3" });
  assertEquals(args, ["a", "b", "c"]);
});

test("should throw TooManyArgumentsError for extra positional args", () => {
  assertThrows(
    () => {
      parseFlags(["foo", "bar"], {
        flags: [{ name: "recursive", aliases: ["r"], type: "string" }],
        args: [{ type: "string", name: "dir" }],
      });
    },
    Error,
    "Too many arguments: bar",
  );
});

test("should list all extra positional args in TooManyArgumentsError", () => {
  assertThrows(
    () => {
      parseFlags(["foo", "bar", "baz", "beep"], {
        flags: [{ name: "recursive", aliases: ["r"], type: "string" }],
        args: [{ type: "string", name: "dir" }],
      });
    },
    Error,
    "Too many arguments: bar baz beep",
  );
});

test("should not list option values as extra positional args", () => {
  assertThrows(
    () => {
      parseFlags(["foo", "bar", "--recursive", "baz"], {
        flags: [{ name: "recursive", aliases: ["r"], type: "string" }],
        args: [{ type: "string", name: "dir" }],
      });
    },
    Error,
    "Too many arguments: bar",
  );
});

test("should suppress missing args error when standalone option is present", () => {
  const { flags, args } = parseFlags(["--help"], {
    flags: [{ name: "help", standalone: true }],
    args: [{ type: "string" }],
  });
  assertEquals(flags, { help: true });
  assertEquals(args, undefined);
});

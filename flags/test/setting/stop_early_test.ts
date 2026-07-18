import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";

test("flags stopEarly disable", () => {
  const { flags, unknown, literal } = parseFlags([
    "-f",
    "true",
    "run",
    "script-name",
    "--script-arg1",
    "--script-arg2",
    "--",
    "--literal-arg1",
    "--literal-arg2",
  ], {
    stopEarly: false,
    flags: [{
      name: "flag",
      aliases: ["f"],
      type: "boolean",
      optionalValue: true,
    }, {
      name: "script-arg1",
      aliases: ["s"],
      type: "boolean",
      optionalValue: true,
    }, {
      name: "script-arg2",
      aliases: ["S"],
      type: "boolean",
      optionalValue: true,
    }],
  });

  assertEquals(flags, { flag: true, scriptArg1: true, scriptArg2: true });
  assertEquals(unknown, ["run", "script-name"]);
  assertEquals(literal, ["--literal-arg1", "--literal-arg2"]);
});

test("flags stopEarly enabled", () => {
  const { flags, unknown, literal } = parseFlags([
    "-f",
    "true",
    "run",
    "script-name",
    "--script-arg1",
    "--script-arg2",
    "--script-arg3",
    "--",
    "--literal-arg1",
    "--literal-arg2",
  ], {
    stopEarly: true,
    flags: [{
      name: "flag",
      aliases: ["f"],
      type: "boolean",
      optionalValue: true,
    }, {
      name: "script-arg1",
      aliases: ["s"],
      type: "boolean",
      optionalValue: true,
    }, {
      name: "script-arg2",
      aliases: ["S"],
      type: "boolean",
      optionalValue: true,
    }],
  });

  assertEquals(flags, { flag: true });
  assertEquals(
    unknown,
    ["run", "script-name", "--script-arg1", "--script-arg2", "--script-arg3"],
  );
  assertEquals(literal, ["--literal-arg1", "--literal-arg2"]);
});

test("flags stopEarly with expected arguments", () => {
  const { flags, args, unknown, literal } = parseFlags([
    "-f",
    "true",
    "run",
    "script-name",
    "--script-arg1",
    "--",
    "--literal-arg1",
  ], {
    stopEarly: true,
    flags: [{
      name: "flag",
      aliases: ["f"],
      type: "boolean",
      optionalValue: true,
    }],
    args: [{
      name: "script",
      type: "string",
    }, {
      name: "args",
      type: "string",
      variadic: true,
      optional: true,
    }],
  });

  assertEquals(flags, { flag: true });
  assertEquals(args, ["run", "script-name", "--script-arg1"]);
  assertEquals(unknown, []);
  assertEquals(literal, ["--literal-arg1"]);
});

test("flags stopEarly missing required argument", () => {
  assertThrows(
    () =>
      parseFlags(["-f", "true"], {
        stopEarly: true,
        flags: [{
          name: "flag",
          aliases: ["f"],
          type: "boolean",
          optionalValue: true,
        }],
        args: [{
          name: "script",
          type: "string",
        }],
      }),
    Error,
    "Missing argument(s): script",
  );
});

test("flags stopEarly too many arguments", () => {
  assertThrows(
    () =>
      parseFlags(["run", "script-name"], {
        stopEarly: true,
        flags: [],
        args: [{
          name: "script",
          type: "string",
        }],
      }),
    Error,
    "Too many arguments: script-name",
  );
});

test("flags stopEarly parses expected arguments with their type", () => {
  const { args, unknown } = parseFlags(["8080", "--port", "80"], {
    stopEarly: true,
    flags: [],
    args: [{
      name: "port",
      type: "number",
    }, {
      name: "args",
      type: "string",
      variadic: true,
      optional: true,
    }],
  });

  assertEquals(args, [8080, "--port", "80"]);
  assertEquals(unknown, []);
});

test("flags stopEarly throws for an invalid argument type", () => {
  assertThrows(
    () =>
      parseFlags(["not-a-number", "--port", "80"], {
        stopEarly: true,
        flags: [],
        args: [{
          name: "port",
          type: "number",
        }, {
          name: "args",
          type: "string",
          variadic: true,
          optional: true,
        }],
      }),
    Error,
    'Argument "port" must be of type "number", but got "not-a-number".',
  );
});

test("flags stopOnUnknown parses expected arguments with their type", () => {
  const { flags, args, unknown } = parseFlags([
    "--known",
    "value",
    "8080",
    "--unknown",
    "arg",
  ], {
    stopOnUnknown: true,
    flags: [{
      name: "known",
      type: "string",
    }],
    args: [{
      name: "port",
      type: "number",
    }, {
      name: "args",
      type: "string",
      variadic: true,
      optional: true,
    }],
  });

  assertEquals(flags, { known: "value" });
  assertEquals(args, [8080, "--unknown", "arg"]);
  assertEquals(unknown, []);
});

test("flags stopEarly unknown option", () => {
  assertThrows(
    () =>
      parseFlags([
        "-f",
        "true",
        "-t",
        "true",
        "run",
        "script-name",
        "--script-arg1",
        "--script-arg2",
        "--script-arg3",
        "--",
        "--literal-arg1",
        "--literal-arg2",
      ], {
        stopEarly: true,
        flags: [{
          name: "flag",
          aliases: ["f"],
          type: "boolean",
          optionalValue: true,
        }, {
          name: "script-arg1",
          aliases: ["s"],
          type: "boolean",
          optionalValue: true,
        }, {
          name: "script-arg2",
          aliases: ["S"],
          type: "boolean",
          optionalValue: true,
        }],
      }),
    Error,
    `Unknown option "-t".`,
  );
});

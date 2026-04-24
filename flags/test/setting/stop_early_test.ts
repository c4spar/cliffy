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

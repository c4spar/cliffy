import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";

test("[flags] should stop on unknown option with stopOnUnknown enabled", () => {
  const { flags, unknown, literal } = parseFlags([
    "-f",
    "true",
    "--foo",
    "run",
    "script-name",
    "--script-arg1",
    "--script-arg2",
    "--script-arg3",
    "--",
    "--literal-arg1",
    "--literal-arg2",
  ], {
    stopOnUnknown: true,
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
    [
      "--foo",
      "run",
      "script-name",
      "--script-arg1",
      "--script-arg2",
      "--script-arg3",
    ],
  );
  assertEquals(literal, ["--literal-arg1", "--literal-arg2"]);
});

import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { Command } from "../../command.ts";

test("command stopEarly disable", async () => {
  const { options, args, literal } = await new Command()
    .throwErrors()
    .option("-f, --flag [value:boolean]", "description ...")
    .option("-s, --script-arg1 [value:boolean]", "description ...")
    .option("-S, --script-arg2 [value:boolean]", "description ...")
    .arguments("[script:string] [args...:string]")
    .action(() => {})
    .parse([
      "-f",
      "true",
      "run",
      "script-name",
      "--script-arg1",
      "--script-arg2",
      "--",
      "--literal-arg1",
      "--literal-arg2",
    ]);

  assertEquals(options, { flag: true, scriptArg1: true, scriptArg2: true });
  assertEquals(args, ["run", "script-name"]);
  assertEquals(literal, ["--literal-arg1", "--literal-arg2"]);
});

test("command stopEarly enabled", async () => {
  const { options, args, literal } = await new Command()
    .throwErrors()
    .stopEarly()
    .option("-f, --flag [value:boolean]", "description ...")
    .option("-s, --script-arg1 [value:boolean]", "description ...")
    .option("-S, --script-arg2 [value:boolean]", "description ...")
    .arguments("[script:string] [args...:string]")
    .action(() => {})
    .parse([
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
    ]);

  assertEquals(options, { flag: true });
  assertEquals(
    args,
    ["run", "script-name", "--script-arg1", "--script-arg2", "--script-arg3"],
  );
  assertEquals(literal, ["--literal-arg1", "--literal-arg2"]);
});

test("command stopEarly with required argument", async () => {
  const { options, args, literal } = await new Command()
    .throwErrors()
    .stopEarly()
    .option("-f, --flag [value:boolean]", "description ...")
    .option("-s, --script-arg1 [value:boolean]", "description ...")
    .arguments("<script:string> [args...:string]")
    .action(() => {})
    .parse([
      "-f",
      "true",
      "run",
      "script-name",
      "--script-arg1",
      "--script-arg2",
      "--",
      "--literal-arg1",
    ]);

  assertEquals(options, { flag: true });
  assertEquals(
    args,
    ["run", "script-name", "--script-arg1", "--script-arg2"],
  );
  assertEquals(literal, ["--literal-arg1"]);
});

test("command stopEarly missing required argument", async () => {
  const cmd = new Command()
    .throwErrors()
    .stopEarly()
    .option("-f, --flag [value:boolean]", "description ...")
    .arguments("<script:string> [args...:string]")
    .action(() => {});

  await assertRejects(
    async () => {
      await cmd.parse(["-f", "true"]);
    },
    Error,
    "Missing argument(s): script",
  );
});

test("command stopEarly too many arguments", async () => {
  const cmd = new Command()
    .throwErrors()
    .stopEarly()
    .arguments("<script:string>")
    .action(() => {});

  await assertRejects(
    async () => {
      await cmd.parse(["run", "script-name"]);
    },
    Error,
    "Too many arguments: script-name",
  );
});

test("command stopEarly parses typed argument", async () => {
  const { args } = await new Command()
    .throwErrors()
    .stopEarly()
    .arguments("<port:number> [args...:string]")
    .action(() => {})
    .parse(["8080", "--verbose", "extra"]);

  assertEquals(args, [8080, "--verbose", "extra"]);
});

test("command stopEarly throws for an invalid typed argument", async () => {
  const cmd = new Command()
    .throwErrors()
    .stopEarly()
    .arguments("<port:number> [args...:string]")
    .action(() => {});

  await assertRejects(
    async () => {
      await cmd.parse(["not-a-number", "--verbose"]);
    },
    Error,
    'Argument "port" must be of type "number", but got "not-a-number".',
  );
});

test("command stopEarly unknown option", async () => {
  const cmd = new Command()
    .throwErrors()
    .stopEarly()
    .option("-f, --flag [value:boolean]", "description ...")
    .option("-s, --script-arg1 [value:boolean]", "description ...")
    .option("-S, --script-arg2 [value:boolean]", "description ...")
    .action(() => {});

  await assertRejects(
    async () => {
      await cmd.parse([
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
      ]);
    },
    Error,
    `Unknown option "-t". Did you mean option "-h"?`,
  );
});

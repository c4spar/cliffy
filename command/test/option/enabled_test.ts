import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import { assertNotMatch } from "@std/assert/not-match";
import { Command } from "../../command.ts";
import { ValidationError } from "../../_errors.ts";

test("[command] should register an option with enabled: true", async () => {
  const { options, args } = await new Command()
    .throwErrors()
    .option("--flag <value:string>", "description ...", { enabled: true })
    .parse(["--flag", "value"]);

  assertEquals(options, { flag: "value" });
  assertEquals(args, []);
});

test("[command] should not register an option with enabled: false", async () => {
  const cmd = new Command()
    .throwErrors()
    .option("--flag <value:string>", "description ...", { enabled: false })
    .action(() => {});

  await assertRejects(
    () => cmd.parse(["--flag", "value"]),
    ValidationError,
    `Unknown option "--flag".`,
  );
});

test("[command] should register an option with a runtime-true enabled flag", async () => {
  const enabled: boolean = true;
  const { options } = await new Command()
    .throwErrors()
    .option("--flag <value:string>", "description ...", { enabled })
    .parse(["--flag", "value"]);

  assertEquals(options, { flag: "value" });
});

test("[command] should not register an option with a runtime-false enabled flag", async () => {
  const enabled: boolean = false;
  const cmd = new Command()
    .throwErrors()
    .option("--flag <value:string>", "description ...", { enabled })
    .action(() => {});

  await assertRejects(
    () => cmd.parse(["--flag", "value"]),
    ValidationError,
    `Unknown option "--flag".`,
  );
});

test("[command] should omit a disabled option from the help output", () => {
  const output = new Command()
    .throwErrors()
    .option("--enabled <value:string>", "I am registered", { enabled: true })
    .option("--disabled <value:string>", "Nobody registers me!", {
      enabled: false,
    })
    .getHelp();

  assertStringIncludes(output, "--enabled");
  assertNotMatch(output, /--disabled/);
});

test("[command] should not register a disabled global option on subcommands", async () => {
  const cmd = new Command()
    .throwErrors()
    .globalOption("--flag <value:string>", "description ...", {
      enabled: false,
    })
    .command("sub")
    .action(() => {})
    .reset();

  await assertRejects(
    () => cmd.parse(["sub", "--flag", "value"]),
    ValidationError,
    `Unknown option "--flag".`,
  );
});

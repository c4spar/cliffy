import { snapshotTest } from "@cliffy/testing";
import { CompletionsCommand } from "../../completions/completions_command.ts";
import { HelpCommand } from "../../help/help_command.ts";
import { Command } from "../../command.ts";

function command(defaultOptions?: boolean, hintOption?: boolean) {
  const cmd = new Command()
    .throwErrors()
    .version("1.0.0")
    .description("Test description ...")
    .help({
      hints: true,
      types: true,
      colors: false,
      width: 120,
    });

  if (!defaultOptions) {
    cmd.versionOption(false)
      .helpOption(false);
  }

  cmd.option("-t, --test [val:string]", "test description")
    .option(
      "-D, --default [val:string]",
      "I have a default value!",
      { default: "test" },
    )
    .option(
      "--default-func [val:string]",
      "I have a default handler!",
      { default: () => "test" },
    )
    .option(
      "-T, --default-text [val:string]",
      "I have a default text!",
      { defaultText: "test" },
    )
    .option(
      "--default-text-func [val:string]",
      "I have a default text handler!",
      { default: "test", defaultText: (value) => value },
    )
    .option("-r, --required [val:string]", "I am required!", { required: true })
    .option(
      "-H, --hidden [val:string]",
      "Nobody knows about me!",
      { hidden: true },
    )
    .option(
      "-d, --depends [val:string]",
      "I depend on test!",
      { depends: ["test"] },
    )
    .option(
      "-c, --conflicts [val:string]",
      "I conflict with test!",
      { conflicts: ["test"] },
    );

  if (hintOption) {
    cmd.option("-a, --all <val:string>", "I have many hints!", {
      default: "test",
      required: true,
      depends: ["test"],
      conflicts: ["depends"],
    });
  }

  cmd
    .env("SOME_ENV_VAR=<value:number>", "Description ...")
    .env("SOME_ENV_VAR_2 <value>", "Description 2 ...")
    .env("SOME_REQUIRED_ENV_VAR=<value>", "This one is required!", {
      required: true,
    })
    .command("help", new HelpCommand())
    .command("completions", new CompletionsCommand())
    .command("sub-command <input:string> <output:string>")
    .description("sub command description.")
    .command("hidden-command <input:string> <output:string>")
    .description("Nobody knows about me!")
    .hidden()
    .reset();

  return cmd;
}

await snapshotTest({
  name: "command: help command with line break",
  meta: import.meta,
  fn: () => command(true, true).showHelp(),
});

await snapshotTest({
  name: "command: help command with line break but without default options",
  meta: import.meta,
  fn: () => command(false, true).showHelp(),
});

await snapshotTest({
  name: "[command] should print help for root command",
  meta: import.meta,
  steps: {
    rootCommand: { args: ["-h"] },
    fooCommand: { args: ["foo", "-h"] },
  },
  async fn(): Promise<void> {
    const child = new Command()
      .description("Child command.")
      .option("--beep [value:number]", "Beep.")
      .command("foo [bar]")
      .description("Foo command.")
      .option("--Boop [value:number]", "Boop.");

    const cmd = new Command()
      .throwErrors()
      .command("child", child);

    await cmd.getCommand("child")?.parse(Deno.args);
  },
});

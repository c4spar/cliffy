import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { Command } from "../../command.ts";
import { snapshotTest } from "../../../testing/mod.ts";
import { deleteEnv } from "../../../internal/runtime/delete_env.ts";
import { setEnv } from "../../../internal/runtime/set_env.ts";

test("[command] help - help string", () => {
  const cmd = new Command()
    .throwErrors()
    .help("help: xxx")
    .command("foo")
    .command("bar");

  assertEquals(cmd.getHelp(), "help: xxx");
  assertEquals(cmd.getCommand("foo")?.getHelp(), "help: xxx");
  assertEquals(cmd.getCommand("bar")?.getHelp(), "help: xxx");
});

test("[command] help - help handler", () => {
  const cmd = new Command()
    .throwErrors()
    .name("main")
    .help(function () {
      return `help: ${this.getName()}`;
    })
    .command("foo")
    .command("bar")
    .reset();

  assertEquals(cmd.getHelp(), "help: main");
  assertEquals(cmd.getCommand("foo")?.getHelp(), "help: foo");
  assertEquals(cmd.getCommand("bar")?.getHelp(), "help: bar");
});

test("[command] help - override help handler", () => {
  const cmd = new Command()
    .throwErrors()
    .name("main")
    .help(function () {
      return `help: ${this.getName()}`;
    })
    .command("foo")
    .help(`foo help`)
    .command("bar")
    .help(() => `bar help`)
    .reset();

  assertEquals(cmd.getHelp(), "help: main");
  assertEquals(cmd.getCommand("foo")?.getHelp(), "foo help");
  assertEquals(cmd.getCommand("bar")?.getHelp(), "bar help");
});

test("[command] help - help option", async () => {
  let called = 0;
  const cmd = new Command()
    .throwErrors()
    .name("main")
    .helpOption("-x, --x-help", "", () => {
      called++;
    })
    .command("foo", new Command().command("foo-foo"))
    .command("bar")
    .reset();

  await cmd.parse(["-x"]);
  assertEquals(called, 1);
  await cmd.parse(["foo", "-x"]);
  assertEquals(called, 2);
  await cmd.parse(["foo", "foo-foo", "-x"]);
  assertEquals(called, 3);
  await cmd.parse(["bar", "-x"]);
  assertEquals(called, 4);
});

test("[command] help - help option action", async () => {
  let called = 0;
  const cmd = new Command()
    .throwErrors()
    .name("main")
    .helpOption("-x, --x-help", "", {
      action: () => {
        called++;
      },
    })
    .command("foo", new Command().command("foo-foo"))
    .command("bar")
    .reset();

  await cmd.parse(["-x"]);
  assertEquals(called, 1);
  await cmd.parse(["foo", "-x"]);
  assertEquals(called, 2);
  await cmd.parse(["foo", "foo-foo", "-x"]);
  assertEquals(called, 3);
  await cmd.parse(["bar", "-x"]);
  assertEquals(called, 4);
});

test({
  name: "[command] help - should set usage",
  ignore: ["node"],
  fn: () => {
    const cmd = new Command()
      .throwErrors()
      .help({ colors: false })
      .usage("foo bar")
      .arguments("<foo> [bar]");

    assertEquals(
      `
Usage: COMMAND foo bar

Options:

  -h, --help  - Show this help.  
`,
      cmd.getHelp(),
    );
  },
});

test({
  name: "[command] help - should group options",
  ignore: ["node"],
  fn: () => {
    const cmd = new Command()
      .throwErrors()
      .help({ colors: false })
      .option("--foo", "Foo option.")
      .group("Other options")
      .option("--bar", "Bar option.")
      .option("--baz", "Baz option.")
      .group("Other options 2")
      .option("--beep", "Beep option.")
      .option("--boop", "Boop option.");

    assertEquals(
      `
Usage: COMMAND

Options:

  -h, --help  - Show this help.  
  --foo       - Foo option.      

Other options:

  --bar  - Bar option.  
  --baz  - Baz option.  

Other options 2:

  --beep  - Beep option.  
  --boop  - Boop option.  
`,
      cmd.getHelp(),
    );
  },
});

test({
  name: "[command] help - should ignore required options for help option",
  ignore: ["node"],
  fn: async () => {
    const ctx = await new Command()
      .noExit()
      .name("bug-with-help-and-required-options")
      .version("0.1.0")
      .description("Help does not work if you have required option(s).")
      .command("bar")
      .description("Help doesn't work, because -f is required.")
      .option("-f, --file <file:string>", "file path", { required: true })
      // .action((options) => console.log(options))
      .parse(["bar", "--help"]);

    assertEquals(ctx.options, { help: true });
  },
});

await snapshotTest({
  name: "should print help for arguments defined with argument method",
  meta: import.meta,
  steps: {
    help: { args: ["-h"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .version("1.0.0")
      .name("arguments-test")
      .option("-f, --file1 <path:file>", "...", { required: true })
      .argument("<foo:string>", "Foo description.")
      .argument("[bar:number]", "Bar description.")
      .argument("[...baz:boolean]", "Baz description.")
      .parse();
  },
});

await snapshotTest({
  name:
    "should print help for additionally added arguments with argument method",
  meta: import.meta,
  steps: {
    help: { args: ["-h"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .version("1.0.0")
      .name("arguments-test")
      .option("-f, --file1 <path:file>", "...", { required: true })
      .arguments("<beep:string> <boop:number>", [
        "First argument description.",
        "Second argument description.",
      ])
      .argument("<foo:string>", "Foo description.")
      .argument("[bar:number]", "Bar description.")
      .argument("[...baz:boolean]", "Baz description.")
      .parse();
  },
});

await snapshotTest({
  name:
    "should print help when action handler calls showHelp with arrow function",
  meta: import.meta,
  steps: {
    help: { args: [] },
  },
  async fn(): Promise<void> {
    const cmd = new Command()
      .name("git")
      .action(() => cmd.showHelp())
      .command("pull", "Pull changes from remote repository.")
      .action(() => console.log("Pulling..."))
      .command("fetch", "Fetch changes from remote repository.")
      .action(() => console.log("Fetching..."));

    await cmd.parse();
  },
});

await snapshotTest({
  name:
    "should not show help when auto help option is enabled if action handler is defined even if no arguments are provided",
  meta: import.meta,
  steps: {
    mainCommand: { args: [] },
    fooCommand: { args: ["foo"] },
    barCommand: { args: ["foo", "bar"] },
  },
  async fn(): Promise<void> {
    const fooCommand = new Command()
      .action(() => {})
      .command("bar", "A subcommand.")
      .command("baz", "Another subcommand.");

    await new Command()
      .name("auto-help-test")
      .description("Test auto help option.")
      .help({ auto: true })
      .noExit()
      .action(() => {})
      .command("foo", fooCommand)
      .parse();
  },
});

await snapshotTest({
  name:
    "should show help when auto help option is enabled for commands with subcommands and no action handler if no arguments are provided",
  meta: import.meta,
  steps: {
    mainCommand: { args: [] },
    fooCommand: { args: ["foo"] },
    barCommand: { args: ["foo", "bar"] },
  },
  async fn(): Promise<void> {
    const fooCommand = new Command()
      .command("bar", "A subcommand.")
      .command("baz", "Another subcommand.");

    await new Command()
      .name("auto-help-test")
      .description("Test auto help option.")
      .help({ auto: true })
      .noExit()
      .command("foo", fooCommand)
      .parse();
  },
});

await snapshotTest({
  name:
    "should show help when auto help option is enabled with global environment variable defined",
  meta: import.meta,
  denoArgs: ["--quiet", "--allow-env"],
  steps: {
    mainCommand: { args: [] },
    fooCommand: { args: ["foo"] },
    barCommand: { args: ["foo", "bar"] },
  },
  async fn(): Promise<void> {
    setEnv("NO_COLOR", "1");

    const fooCommand = new Command()
      .command("bar", "A subcommand.")
      .command("baz", "Another subcommand.");

    await new Command()
      .name("auto-help-test")
      .description("Test auto help option.")
      .globalEnv("NO_COLOR", "Disable colors in help output.")
      .help({ auto: true })
      .noExit()
      .command("foo", fooCommand)
      .parse();

    deleteEnv("NO_COLOR");
  },
});

await snapshotTest({
  name:
    "should not show help when auto help option is enabled but no subcommands are defined",
  meta: import.meta,
  steps: {
    noArgs: { args: [] },
    withArgs: { args: ["-f"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .option("-f, --foo", "Foo option.")
      .option("-b, --bar", "Bar option.")
      .help({ auto: true })
      .noExit()
      .parse();
  },
});

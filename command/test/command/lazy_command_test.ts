import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { assertEquals, assertExists, assertStrictEquals } from "@std/assert";
import { test } from "@cliffy/internal/testing/test";
import { getOs } from "@cliffy/internal/runtime/get-os";
import { snapshotTest } from "../../../testing/mod.ts";
import { Command } from "../../command.ts";
import { HelpCommand } from "../../help/help_command.ts";
import { CompletionsCommand } from "../../completions/mod.ts";
import { EnumType } from "../../mod.ts";

test("should preserve settings configured by the lazy loaded command", async () => {
  const loaded = new Command()
    .description("loaded description")
    .hidden()
    .stopEarly()
    .noExit()
    .action(() => {});

  const main = new Command()
    .name("main")
    .command("foo", () => Promise.resolve(loaded));

  const cmd = await main.loadBaseCommand("foo");

  assertExists(cmd);
  assertStrictEquals(cmd, loaded);
  assertEquals(cmd.getDescription(), "loaded description");
  assertEquals(cmd.settings.isHidden, true);
  assertEquals(cmd.settings.stopEarly, true);
  assertEquals(cmd.settings.shouldExit, false);
  assertEquals(typeof cmd.settings.actionHandler, "function");
});

test("should override lazy loaded command settings", async () => {
  const loaded = new Command()
    .description("loaded description")
    .stopEarly()
    .noExit()
    .alias("loaded-alias");

  const main = new Command()
    .name("main")
    .command("foo", () => Promise.resolve(loaded))
    .description("registration description")
    .alias("registration-alias")
    .hidden()
    .stopEarly(false);

  const cmd = await main.loadBaseCommand("foo", true);

  assertExists(cmd);
  assertEquals(cmd.getDescription(), "registration description");
  assertEquals(cmd.settings.isHidden, true);
  assertEquals(cmd.settings.stopEarly, false);
  assertEquals(cmd.settings.shouldExit, false);
  assertEquals(cmd.getAliases(), ["loaded-alias", "registration-alias"]);
  assertStrictEquals(main.getBaseCommand("registration-alias", true), cmd);
  assertStrictEquals(main.getBaseCommand("loaded-alias", true), cmd);
});

test("should lazy load command from default export", async () => {
  const loaded = new Command().description("loaded description");

  const main = new Command()
    .name("main")
    .command("foo", () => Promise.resolve({ default: loaded }));

  const cmd = await main.loadBaseCommand("foo");

  assertStrictEquals(cmd, loaded);
});

test("should execute action of lazy loaded command", async () => {
  const actionSpy = spy();

  const subCommand = new Command()
    .arguments("<input:string>")
    .action(actionSpy);

  const main = new Command()
    .name("main")
    .throwErrors()
    .command("foo", () => Promise.resolve(subCommand));

  await main.parse(["foo", "input-value"]);

  assertSpyCall(actionSpy, 0, { args: [{}, "input-value"] });
  assertSpyCalls(actionSpy, 1);
});

test("should load lazy command only once for concurrent loads", async () => {
  const lazySpy = spy(() =>
    Promise.resolve(new Command().description("loaded description"))
  );

  const main = new Command()
    .name("main")
    .command("foo", lazySpy);

  const [first, second] = await Promise.all([
    main.loadBaseCommand("foo"),
    main.loadBaseCommand("foo"),
  ]);

  assertExists(first);
  assertStrictEquals(first, second);
  assertSpyCalls(lazySpy, 1);
});

await snapshotTest({
  name: "lazy command help integration",
  meta: import.meta,
  ignore: getOs() === "windows",
  steps: {
    "should print the auto help of a container command": { args: [] },
    "should print the help option output": { args: ["--help"] },
    "should print the help of a lazy sub command": {
      args: ["clone", "--help"],
    },
    "should print the help command output": { args: ["help"] },
    "should print the help command output of a lazy sub command": {
      args: ["help", "clone"],
    },
  },
  async fn() {
    await new Command()
      .name("lazy-test")
      .command(
        "clone",
        () =>
          new Command()
            .description("Clone a repository.")
            .option("-r, --recursive", "Clone recursive.")
            .command("mirror", "Mirror a repository."),
      )
      .command("hidden-one", () => new Command().hidden().action(() => {}))
      .command("global", () => new Command().description("Global command."))
      .global()
      .command("help", new HelpCommand().global())
      .parse();
  },
});

await snapshotTest({
  name: "lazy command completions integration",
  meta: import.meta,
  ignore: getOs() === "windows",
  steps: {
    "should complete a custom type of a lazy command": {
      args: ["completions", "complete", "color", "clone"],
    },
    "should complete a completion of a lazy command": {
      args: ["completions", "complete", "branch", "clone"],
    },
    "should generate bash completions": { args: ["completions", "bash"] },
    "should generate fish completions": { args: ["completions", "fish"] },
    "should generate zsh completions": { args: ["completions", "zsh"] },
  },
  async fn() {
    await new Command()
      .name("lazy-test")
      .globalType("color", new EnumType(["blue", "yellow", "red"]))
      .command(
        "clone",
        () =>
          new Command()
            .description("Clone a repository.")
            .complete("branch", () => ["main", "develop"])
            .option("-r, --recursive", "Clone recursive.")
            .option("-b, --branch <name:string:branch>", "Branch.")
            .option("-c, --color <val:color>", "Color option.")
            .command("mirror", "Mirror a repository.")
            .reset(),
      )
      .reset()
      .command("completions", new CompletionsCommand())
      .reset()
      .parse();
  },
});

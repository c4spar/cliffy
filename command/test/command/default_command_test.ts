import { test } from "@cliffy/internal/testing/test";
import { assertRejects } from "@std/assert";
import { Command } from "@cliffy/command";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { DefaultCommandNotFoundError } from "../../_errors.ts";

test("should execute default command if no arguments have been defined", async () => {
  const defaultSpy = spy();
  const otherSpy = spy();
  const mainActionSpy = spy();

  const command = new Command()
    .name("test")
    .default("my-default-command")
    .action(mainActionSpy)
    .command("my-default-command", "My default command")
    .action(defaultSpy)
    .command("other-command", "Other command")
    .action(otherSpy);

  await command.parse([]);

  assertSpyCalls(mainActionSpy, 0);
  assertSpyCalls(defaultSpy, 1);
  assertSpyCalls(otherSpy, 0);
});

test("should not execute default command if arguments have been defined", async () => {
  const defaultSpy = spy();
  const otherSpy = spy();
  const mainActionSpy = spy();

  const command = new Command()
    .name("test")
    .default("my-default-command")
    .action(mainActionSpy)
    .command("my-default-command", "My default command")
    .action(defaultSpy)
    .command("other-command", "Other command")
    .action(otherSpy);

  await command.parse(["other-command"]);

  assertSpyCalls(mainActionSpy, 0);
  assertSpyCalls(defaultSpy, 0);
  assertSpyCalls(otherSpy, 1);
  assertSpyCall(otherSpy, 0, { args: [{}] });
});

test("should not execute default command if a global option has been defined", async () => {
  const defaultSpy = spy();
  const otherSpy = spy();
  const mainActionSpy = spy();

  const command = new Command()
    .name("test")
    .globalOption("--global", "Global option")
    .default("my-default-command")
    .action(mainActionSpy)
    .command("my-default-command", "My default command")
    .action(defaultSpy)
    .command("other-command", "Other command")
    .action(otherSpy);

  await command.parse(["--global"]);

  assertSpyCalls(mainActionSpy, 1);
  assertSpyCall(mainActionSpy, 0, { args: [{ global: true }] });
  assertSpyCalls(defaultSpy, 0);
  assertSpyCalls(otherSpy, 0);
});

test("should throw if default command does not exist", async () => {
  const command = new Command()
    .name("test")
    .default("non-existing-command")
    .command("my-default-command", "My default command")
    .action(() => {});

  await assertRejects(
    () => command.parse([]),
    DefaultCommandNotFoundError,
    `Default command "non-existing-command" not found. Did you mean command "my-default-command"?`,
  );
});

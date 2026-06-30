// deno-fmt-ignore-file

import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { snapshotTest } from "../../../testing/snapshot.ts";
import { Command } from "../../command.ts";
import { CompletionsCommand } from "../../completions/completions_command.ts";
import type { Completion } from "../../types.ts";

function command() {
  return new Command()
    .throwErrors()
    .globalComplete("global", () => ["global1", "global2"])
    .complete("foo", () => ["foo1", "foo2"])
    .command(
      "bar",
      new Command()
        .complete("bar", () => ["bar1", "bar2"])
        .command("baz")
        .complete("baz", () => ["baz1", "baz2"]),
    );
}

test("command - completion - completion properties", () => {
  const cmd = new Command()
    .throwErrors()
    .complete("foo", () => ["foo1", "foo2"])
    .complete("bar", () => ["bar1", "bar2"], {
      global: true,
      override: true,
    });
  const fooCompletion: Completion = cmd.getCompletion("foo") as Completion;
  const barCompletion: Completion = cmd.getCompletion("bar") as Completion;
  assertEquals(fooCompletion.name, "foo");
  assertEquals(fooCompletion.global, undefined);
  assertEquals(barCompletion.name, "bar");
  assertEquals(barCompletion.global, true);
});

test("command - completion - get completions", () => {
  const cmd = command();
  assertEquals(cmd.getCompletions().length, 2);
  assertEquals(!!cmd.getCompletions().find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getCompletions().find((opt) => opt.name === "foo"), true);
});

test("command - completion - get base completions", () => {
  const cmd = command();
  assertEquals(cmd.getBaseCompletions().length, 2);
  assertEquals(!!cmd.getBaseCompletions().find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getBaseCompletions().find((opt) => opt.name === "foo"), true);
});

test("command - completion - get global completions", () => {
  const cmd = command();
  assertEquals(cmd.getCommand("bar")?.getGlobalCompletions().length, 1);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalCompletions().find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalCompletions().find((opt) => opt.name === "foo"), false);
});

test("command - completion - get completion", () => {
  const cmd = command();
  assertEquals(cmd.getCompletion("global")?.name, "global");
  assertEquals(cmd.getCompletion("foo")?.name, "foo");
  assertEquals(cmd.getCompletion("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCompletion("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getCompletion("bar")?.name, "bar");
  assertEquals(cmd.getCommand("bar")?.getCompletion("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getCompletion("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getCompletion("baz")?.name, "baz");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getCompletion("unknown")?.name, undefined);
});

test("command - completion - get base completion", () => {
  const cmd = command();
  assertEquals(cmd.getBaseCompletion("global")?.name, "global");
  assertEquals(cmd.getBaseCompletion("foo")?.name, "foo");
  assertEquals(cmd.getBaseCompletion("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseCompletion("global")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseCompletion("bar")?.name, "bar");
  assertEquals(cmd.getCommand("bar")?.getBaseCompletion("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseCompletion("global")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseCompletion("baz")?.name, "baz");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseCompletion("unknown")?.name, undefined);
});

test("command - completion - get global completion", () => {
  const cmd = command();
  assertEquals(cmd.getGlobalCompletion("global")?.name, undefined);
  assertEquals(cmd.getGlobalCompletion("foo")?.name, undefined);
  assertEquals(cmd.getGlobalCompletion("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalCompletion("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getGlobalCompletion("bar")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalCompletion("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalCompletion("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalCompletion("baz")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalCompletion("unknown")?.name, undefined);
});

await snapshotTest({
  name: "should handle file type completions in options",
  meta: import.meta,
  steps: {
    zsh: { args: ["completions", "zsh"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .version("1.0.0")
      .name("completions-test")
      // first option argument
      .command("foo")
      .option("-f, --file1 <path:file>", "...", { required: true })
      // second option argument
      .command("bar")
      .option("-f, --file2 <name:string> <path:file>", "...", { required: true })
      // rest option argument
      .command("beep")
      .option("-f, --file3 <...path:file>", "...", { required: true })
      // second rest option argument
      .command("boop")
      .option("-f, --file4 <name:string> <...path:file>", "...", { required: true })
      // completion command
      .command("completions", new CompletionsCommand())
      .parse();
  },
});

await snapshotTest({
  name: "should escape special characters in option descriptions",
  meta: import.meta,
  steps: {
    zsh: { args: ["completions", "zsh"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .version("1.0.0")
      .name("completions-test")
      .option("--backslash <val:string>", "description with \\backslash")
      .option("--double-quote <val:string>", 'description with "double quotes"')
      .option("--brackets <val:string>", "description with [brackets]")
      .option("--single-quote <val:string>", "description with 'single quotes'")
      .command("completions", new CompletionsCommand())
      .parse();
  },
});

await snapshotTest({
  name: "should escape backslashes in option descriptions for fish completions",
  meta: import.meta,
  steps: {
    fish: { args: ["completions", "fish"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .version("1.0.0")
      .name("completions-test")
      .option("--double-backslash <val:string>", "write a \\\\ for a backslash")
      .option("--trailing-backslash <val:string>", "ends with a backslash\\")
      .option("--single-quote <val:string>", "description with 'single quotes'")
      .command("completions", new CompletionsCommand())
      .parse();
  },
});

await snapshotTest({
  name: "should generate file type completions in arguments",
  meta: import.meta,
  steps: {
    zsh: { args: ["completions", "zsh"] },
  },
  async fn(): Promise<void> {
    await new Command()
      .version("1.0.0")
      .name("completions-test")
      // first argument
      .command("foo")
      .arguments("<path:file>")
      // second argument
      .command("bar")
      .arguments("<name:string> <path:file>")
      // rest argument
      .command("beep")
      .arguments("<...path:file>")
      // second rest argument
      .command("boop")
      .arguments("<name:string> <...path:file>")
      // completion command
      .command("completions", new CompletionsCommand())
      .parse();
  },
});

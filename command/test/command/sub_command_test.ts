import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { Command } from "../../command.ts";

const version = "1.0.0";
const description = "Test description ...";

type States = Record<string, boolean>;

function command(states: States = {}) {
  return new Command()
    .throwErrors()
    .version(version)
    .description(description)
    .arguments("[command]")
    // sub-command
    .command("sub-command <input:string> <output:string>")
    .option("-f, --flag [value:string]", "description ...", { required: true })
    .action(() => {
      states.action1 = true;
    })
    // sub-command2
    .command(
      "sub-command2 <input:string> <output:string>",
      new Command()
        .description(description)
        .arguments("[command]")
        .action(() => {
          states.action2 = true;
        })
        // sub-command3
        .command("sub-command3 <input:string> <output:string>")
        .option("-e, --eee [value:string]", "description ...")
        .action(() => {
          states.action3 = true;
        }),
    );
}

test("command - sub command - sub-command with arguments", async () => {
  const stats: States = {};
  // deno-lint-ignore no-explicit-any
  const cmd: Command<any> = command(stats);
  const { options, args } = await cmd.parse(
    ["sub-command", "input-path", "output-path", "-f"],
  );

  assertEquals(options, { flag: true });
  assertEquals(args[0], "input-path");
  assertEquals(args[1], "output-path");
  assertEquals(stats.action1, true);
  assertEquals(stats.action2, undefined);
  assertEquals(stats.action3, undefined);
});

test("command - sub command - sub-command2 with arguments", async () => {
  const stats: States = {};
  // deno-lint-ignore no-explicit-any
  const cmd: Command<any> = command(stats);
  const { options, args } = await cmd.parse(
    ["sub-command2", "input-path", "output-path"],
  );

  assertEquals(options, {});
  assertEquals(args[0], "input-path");
  assertEquals(args[1], "output-path");
  assertEquals(stats.action1, undefined);
  assertEquals(stats.action2, true);
  assertEquals(stats.action3, undefined);
});

test("command - sub command - nested child command with arguments", async () => {
  const stats: States = {};
  // deno-lint-ignore no-explicit-any
  const cmd: Command<any> = command(stats);
  const { options, args } = await cmd.parse(
    ["sub-command2", "sub-command3", "input-path", "output-path"],
  );

  assertEquals(options, {});
  assertEquals(args[0], "input-path");
  assertEquals(args[1], "output-path");
  assertEquals(stats.action1, undefined);
  assertEquals(stats.action2, undefined);
  assertEquals(stats.action3, true);
});

test("[command] sub command - sub-command with missing argument", async () => {
  await assertRejects(
    async () => {
      await command().parse(["sub-command", "input-path", "-f"]);
    },
    Error,
    "Missing argument: output",
  );
});

test("[command] sub command - sub-command with missing flag", async () => {
  await assertRejects(
    async () => {
      await command().parse(["sub-command", "input-path"]);
    },
    Error,
    'Missing required option "--flag".',
  );
});

test("[command] sub command - sub-command 2 with missing argument", async () => {
  await assertRejects(
    async () => {
      await command().parse(["sub-command2", "input-path"]);
    },
    Error,
    "Missing argument: output",
  );
});

test("[command] sub command - nested sub-command with missing argument", async () => {
  await assertRejects(
    async () => {
      await command().parse(["sub-command2", "sub-command3", "input-path"]);
    },
    Error,
    "Missing argument: output",
  );
});

test("[command] sub command - command with empty name", async () => {
  await assertRejects(
    async () => {
      await new Command()
        .command("")
        .parse(["foo"]);
    },
    Error,
    "Missing command name.",
  );
});

test("[command] sub command - override child command", async () => {
  const { options, args } = await new Command()
    .command("foo")
    .command("foo", "...", { override: true })
    .option("--beep [value:string]", "boop")
    .parse(["foo", "--beep", "boop"]);

  assertEquals(options, { beep: "boop" });
  assertEquals(args, []);
});

test("[command] sub command - duplicate command name", async () => {
  await assertRejects(
    async () => {
      await new Command()
        .command("foo")
        .command("foo")
        .parse(["foo"]);
    },
    Error,
    `Duplicate command name "foo".`,
  );
});

test("[command] sub command - select sub-command", () => {
  const cmd = new Command()
    .command("foo")
    .command("bar");

  cmd.select("foo");
  cmd.select("bar");

  assertThrows(
    () => cmd.select("baz"),
    Error,
    `Unknown command "baz". Did you mean command "bar"?`,
  );
});

test("[command] should execute parse method on child command", async () => {
  const childActionSpy = spy();
  const child = new Command()
    .description("Child command.")
    .command("foo [bar:string]")
    .description("Foo command.")
    .option("--beep [value:number]", "boop")
    .action(childActionSpy);

  const cmd = new Command()
    .throwErrors()
    .command("child", child);

  await cmd.getCommand("child")?.parse(["foo", "bar", "--beep", "1"]);

  assertSpyCalls(childActionSpy, 1);
  assertSpyCall(childActionSpy, 0, {
    args: [{ beep: 1 }, "bar"],
  });
});

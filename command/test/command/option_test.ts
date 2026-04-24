// deno-fmt-ignore-file

import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { bold } from "@std/fmt/colors";
import { Command } from "../../command.ts";
import type { Option } from "../../types.ts";

function command() {
  return new Command()
    .throwErrors()
    .globalOption("-g, --global", "...")
    .globalOption("-G, --global-hidden", "...", { hidden: true })
    .option("-f, --foo", "...")
    .option("-F, --foo-hidden", "...", { hidden: true })
    .command(
      "bar",
      new Command()
        .option("-b, --bar", "...")
        .option("-B, --bar-hidden", "...", { hidden: true })
        .command("baz")
        .option("-z, --baz", "...")
        .option("-Z, --baz-hidden", "...", { hidden: true })
        .reset(),
    );
}

test("command - option - option properties", () => {
  const option: Option = new Command()
    .throwErrors()
    .option("-F, --foo-bar <baz:boolean> [baz:string]", "test ...", {
      required: true,
      global: true,
      hidden: true,
      conflicts: ["beep"],
      depends: ["boop"],
      override: true,
      prepend: true,
      standalone: true,
      collect: true,
      default: false,
      defaultText: "false",
    })
    .getOption("foo-bar", true) as Option;

  assertEquals(option.name, "foo-bar");
  assertEquals(option.description, "test ...");
  assertEquals(option.flags, ["-F", "--foo-bar"]);
  assertEquals(option.typeDefinition, "<baz:boolean> [baz:string]");

  assertEquals(option.required, true);
  assertEquals(option.global, true);
  assertEquals(option.hidden, true);
  assertEquals(option.conflicts, ["beep"]);
  assertEquals(option.depends, ["boop"]);
  assertEquals(option.override, true);
  assertEquals(option.prepend, true);
  assertEquals(option.standalone, true);
  assertEquals(option.collect, true);
  assertEquals(option.default, false);
  assertEquals(option.defaultText, "false");

  assertEquals(option.args, [{
    action: "boolean",
    description: undefined,
    list: false,
    name: "baz",
    optional: false,
    type: "boolean",
    variadic: false,
    raw: "<baz:boolean>",
  }, {
    action: "string",
    description: undefined,
    list: false,
    name: "baz",
    optional: true,
    type: "string",
    variadic: false,
    raw: "[baz:string]",
  }]);
});

test("command - option - has options", () => {
  const cmd = command();
  assertEquals(cmd.hasOptions(), true);
  assertEquals(cmd.hasOptions(true), true);
  assertEquals(new Command().hasOptions(), false);
  assertEquals(new Command().hasOptions(true), false);
});

test("command - option - get options", () => {
  const cmd = command();
  assertEquals(cmd.getOptions().length, 2);
  assertEquals(cmd.getOptions(true).length, 4);
  assertEquals(!!cmd.getOptions().find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getOptions(true).find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getOptions().find((opt) => opt.name === "global-hidden"), false);
  assertEquals(!!cmd.getOptions(true).find((opt) => opt.name === "global-hidden"), true);
  assertEquals(!!cmd.getOptions().find((opt) => opt.name === "foo"), true);
  assertEquals(!!cmd.getOptions(true).find((opt) => opt.name === "foo"), true);
  assertEquals(!!cmd.getOptions().find((opt) => opt.name === "foo-hidden"), false);
  assertEquals(!!cmd.getOptions(true).find((opt) => opt.name === "foo-hidden"), true);
});

test("command - option - get base options", () => {
  const cmd = command();
  assertEquals(cmd.getBaseOptions().length, 2);
  assertEquals(cmd.getBaseOptions(true).length, 4);
  assertEquals(!!cmd.getBaseOptions().find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getBaseOptions(true).find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getBaseOptions().find((opt) => opt.name === "global-hidden"), false);
  assertEquals(!!cmd.getBaseOptions(true).find((opt) => opt.name === "global-hidden"), true);
  assertEquals(!!cmd.getBaseOptions().find((opt) => opt.name === "foo"), true);
  assertEquals(!!cmd.getBaseOptions(true).find((opt) => opt.name === "foo"), true);
  assertEquals(!!cmd.getBaseOptions().find((opt) => opt.name === "foo-hidden"), false);
  assertEquals(!!cmd.getBaseOptions(true).find((opt) => opt.name === "foo-hidden"), true);
});

test("command - option - get global options", () => {
  const cmd = command();
  assertEquals(cmd.getCommand("bar")?.getGlobalOptions().length, 1);
  assertEquals(cmd.getCommand("bar")?.getGlobalOptions(true).length, 2);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions().find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions(true).find((opt) => opt.name === "global"), true);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions().find((opt) => opt.name === "global-hidden"), false);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions(true).find((opt) => opt.name === "global-hidden"), true);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions().find((opt) => opt.name === "foo"), false);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions(true).find((opt) => opt.name === "foo"), false);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions().find((opt) => opt.name === "foo-hidden"), false);
  assertEquals(!!cmd.getCommand("bar")?.getGlobalOptions(true).find((opt) => opt.name === "foo-hidden"), false);
});

test("command - option - has option", () => {
  const cmd = command();
  assertEquals(cmd.hasOption("global"), true);
  assertEquals(cmd.hasOption("global-hidden"), false);
  assertEquals(cmd.hasOption("global-hidden", true), true);
  assertEquals(cmd.hasOption("foo"), true);
  assertEquals(cmd.hasOption("foo-hidden"), false);
  assertEquals(cmd.hasOption("foo-hidden", true), true);
  assertEquals(cmd.hasOption("unknown"), false);
  assertEquals(cmd.getCommand("bar")?.hasOption("global"), true);
  assertEquals(cmd.getCommand("bar")?.hasOption("global-hidden"), false);
  assertEquals(cmd.getCommand("bar")?.hasOption("global-hidden", true), true);
  assertEquals(cmd.getCommand("bar")?.hasOption("bar"), true);
  assertEquals(cmd.getCommand("bar")?.hasOption("bar-hidden"), false);
  assertEquals(cmd.getCommand("bar")?.hasOption("bar-hidden", true), true);
  assertEquals(cmd.getCommand("bar")?.hasOption("unknown"), false);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("global"), true);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("global-hidden"), false);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("global-hidden", true), true);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("baz"), true);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("baz-hidden"), false);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("baz-hidden", true), true);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.hasOption("unknown"), false);
});

test("command - option - get option", () => {
  const cmd = command();
  assertEquals(cmd.getOption("global")?.name, "global");
  assertEquals(cmd.getOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getOption("global-hidden", true)?.name, "global-hidden");
  assertEquals(cmd.getOption("foo")?.name, "foo");
  assertEquals(cmd.getOption("foo-hidden")?.name, undefined);
  assertEquals(cmd.getOption("foo-hidden", true)?.name, "foo-hidden");
  assertEquals(cmd.getOption("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getOption("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getOption("global-hidden", true)?.name, "global-hidden");
  assertEquals(cmd.getCommand("bar")?.getOption("bar")?.name, "bar");
  assertEquals(cmd.getCommand("bar")?.getOption("bar-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getOption("bar-hidden", true)?.name, "bar-hidden");
  assertEquals(cmd.getCommand("bar")?.getOption("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("global-hidden", true)?.name, "global-hidden");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("baz")?.name, "baz");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("baz-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("baz-hidden", true)?.name, "baz-hidden");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getOption("unknown")?.name, undefined);
});

test("command - option - get base option", () => {
  const cmd = command();
  assertEquals(cmd.getBaseOption("global")?.name, "global");
  assertEquals(cmd.getBaseOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getBaseOption("global-hidden", true)?.name, "global-hidden");
  assertEquals(cmd.getBaseOption("foo")?.name, "foo");
  assertEquals(cmd.getBaseOption("foo-hidden")?.name, undefined);
  assertEquals(cmd.getBaseOption("foo-hidden", true)?.name, "foo-hidden");
  assertEquals(cmd.getBaseOption("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseOption("global")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseOption("global-hidden", true)?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseOption("bar")?.name, "bar");
  assertEquals(cmd.getCommand("bar")?.getBaseOption("bar-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseOption("bar-hidden", true)?.name, "bar-hidden");
  assertEquals(cmd.getCommand("bar")?.getBaseOption("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("global")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("global-hidden", true)?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("baz")?.name, "baz");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("baz-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("baz-hidden", true)?.name, "baz-hidden");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getBaseOption("unknown")?.name, undefined);
});

test("command - option - get global option", () => {
  const cmd = command();
  assertEquals(cmd.getGlobalOption("global")?.name, undefined);
  assertEquals(cmd.getGlobalOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getGlobalOption("global-hidden", true)?.name, undefined);
  assertEquals(cmd.getGlobalOption("foo")?.name, undefined);
  assertEquals(cmd.getGlobalOption("foo-hidden")?.name, undefined);
  assertEquals(cmd.getGlobalOption("foo-hidden", true)?.name, undefined);
  assertEquals(cmd.getGlobalOption("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("global-hidden", true)?.name, "global-hidden");
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("bar")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("bar-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("bar-hidden", true)?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getGlobalOption("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("global")?.name, "global");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("global-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("global-hidden", true)?.name, "global-hidden");
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("baz")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("baz-hidden")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("baz-hidden", true)?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getCommand("baz")?.getGlobalOption("unknown")?.name, undefined);
});

test("command - option - remove option", () => {
  const cmd = command();
  assertEquals(cmd.getOption("foo")?.name, "foo");
  assertEquals(cmd.removeOption("foo")?.name, "foo");
  assertEquals(cmd.getOption("foo"), undefined);
  assertEquals(cmd.removeOption("foo"), undefined);
});

test("command - option - duplicate option", () => {
  assertThrows(
    () => {
      new Command()
        .option("-f, --foo", "...")
        .option("-x, --foo", "...");
    },
    Error,
    `An option with name '${
      bold("--foo")
    }' is already registered on command '${
      bold("COMMAND")
    }'. If it is intended to override the option, set the '${
      bold("override")
    }' option of the '${bold("option")}' method to true`,
  );
});

test("command - option - override existing option", async () => {
  const { options } = await new Command()
    .option("-f, --foo", "...")
    .option("-x, --foo, --foo-override", "...", { override: true })
    .parse(["--foo-override"]);
  assertEquals(options, { foo: true });
});

test("command - option - option value handler", async () => {
  const { options } = await new Command()
    .option("-f, --foo <value:string>", "...", (value) => ({ value }))
    .parse(["--foo", "bar"]);
  assertEquals(options, { foo: { value: "bar" } });
});

test("command - option - global option value handler", async () => {
  const { options } = await new Command()
    .globalOption("-f, --foo <value:string>", "...", (value) => ({ value }))
    .command("foo")
    .parse(["foo", "--foo", "bar"]);
  assertEquals(options, { foo: { value: "bar" } });
});

test("command - option - should skip optional arguments with an empty value", async () => {
  const { options, args } = await new Command()
    .noExit()
    .option("--foo [value:number]", "...")
    .option("--bar <value:boolean>", "...")
    .option("--baz <value:string>", "...")
    .option("--beep <value:string>", "...", { collect: true })
    .option("--boop <value:number>", "...")
    .option("--multi [value:string] [value:string] [value:string]", "...")
    .option("--variadic [...value:string]", "...")
    .parse([
      "--foo",
      "",
      "--bar",
      "",
      "--baz",
      "",
      "--boop",
      "1",
      "--beep",
      "",
      "--beep",
      "beep-value-2",
      "--beep",
      "",
      "--beep",
      "beep-value-4",
      "--multi",
      "",
      "multi-value-2",
      "",
      "--variadic",
      "",
      "variadic-value-2",
      "",
      "variadic-value-4",
      "",
    ]);

  assertEquals({ options, args }, {
    options: {
      beep: [
        "beep-value-2",
        "beep-value-4",
      ],
      boop: 1,
      multi: [
        undefined,
        "multi-value-2",
        undefined,
      ],
      variadic: [
        "variadic-value-2",
        "variadic-value-4",
      ],
    },
    args: [],
  });
});

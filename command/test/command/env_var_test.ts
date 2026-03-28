// deno-fmt-ignore-file

import { test } from "@cliffy/internal/testing/test";
import { deleteEnv } from "@cliffy/internal/runtime/delete-env";
import { setEnv } from "@cliffy/internal/runtime/set-env";
import { assertEquals, assertRejects } from "@std/assert";
import { Command } from "../../command.ts";
import type { EnvVar } from "../../types.ts";

function command() {
  return new Command()
    .throwErrors()
    .globalEnv("global=<value:boolean>", "...")
    .globalEnv(
      "global_hidden=<value:string>",
      "...",
      { hidden: true },
    )
    .globalEnv(
      "global_required=<value:number>",
      "...",
      { required: true },
    )
    .globalEnv(
      "prefix_global_prefixed=<value:string>",
      "...",
      { prefix: "prefix_" },
    )
    .env("foo=<value:boolean>", "...")
    .env("foo_hidden=<value:string>", "...", {
      hidden: true,
    })
    .env("foo_required=<value:number>", "...", {
      required: true,
    })
    .env(
      "prefix_foo_prefixed=<value:string>",
      "...",
      {
        prefix: "prefix_",
      },
    )
    .option(
      "--global-prefixed <value>",
      "...",
    )
    .action(() => {})
    .command(
      "bar",
      new Command()
        .env("bar", "...")
        .env("bar_hidden", "...", { hidden: true })
        .env("bar_global", "...", { global: true })
        .command("baz")
        .env("baz", "...")
        .env("baz_hidden", "...", { hidden: true })
        .env("baz_global", "...", { global: true })
        .reset(),
    );
}

function setupEnv() {
  setEnv("global", "true");
  setEnv("prefix_global_prefixed", "global");
  setEnv("global_hidden", "global");
  setEnv("global_required", "1");
  setEnv("prefix_foo_prefixed", "foo");
  setEnv("foo", "true");
  setEnv("foo_hidden", "foo");
  setEnv("foo_required", "1");

  setEnv("bar", "true");
  setEnv("bar_hidden", "bar");
  setEnv("bar_required", "1");
  setEnv("baz", "true");
  setEnv("baz_hidden", "baz");
  setEnv("baz_required", "1");
}

function clearEnv() {
  deleteEnv("global");
  deleteEnv("prefix_global_prefixed");
  deleteEnv("global_hidden");
  deleteEnv("global_required");
  deleteEnv("foo");
  deleteEnv("prefix_foo_prefixed");
  deleteEnv("foo_hidden");
  deleteEnv("foo_required");

  deleteEnv("bar");
  deleteEnv("bar_hidden");
  deleteEnv("bar_required");
  deleteEnv("baz");
  deleteEnv("baz_hidden");
  deleteEnv("baz_required");
}

test("[command] - env var - missing required env var", async () => {
  await assertRejects(
    async () => {
      await new Command()
        .throwErrors()
        .env("foo", "...", { required: true })
        .parse([]);
    },
    Error,
    `Missing required environment variable "foo".`,
  );
});

test({
  name: "[command] - env var - ignores required env vars for help",
  ignore: ["node"],
  fn: async () => {
    await new Command()
      .noExit()
      .env("foo", "...", { required: true })
      .parse(["--help"]);
  },
});

test({
  name: "[command] - env var - ignores required env vars for help",
  ignore: ["node"],
  fn: async () => {
    await new Command()
      .noExit()
      .globalEnv("foo", "...", { required: true })
      .command("foo")
      .parse(["foo", "--help"]);
  },
});

test({
  name: "[command] - env var - ignores required env vars for version",
  ignore: ["node"],
  fn: async () => {
    await new Command()
      .noExit()
      .version("1.0.0")
      .env("foo", "...", { required: true })
      .parse(["--version"]);
  },
});

test("[command] - env var - should map the value", async () => {
  setupEnv();
  const { options } = await new Command()
    .throwErrors()
    .env("foo", "...", { value: (value) => Number(value) })
    .parse([]);
  assertEquals(options, { foo: 1 });
  clearEnv();
});

test("[command] - env var - expect valid values", async () => {
  setupEnv();
  const { options } = await command().parse([]);
  assertEquals(options, {
    global: true,
    globalPrefixed: "global",
    globalHidden: "global",
    globalRequired: 1,
    foo: true,
    fooPrefixed: "foo",
    fooHidden: "foo",
    fooRequired: 1,
  });
  clearEnv();
});

test("[command] - env var - override env vars with option", async () => {
  setupEnv();
  const { options } = await command().parse(["--global-prefixed", "global2"]);
  assertEquals(options, {
    global: true,
    globalPrefixed: "global2",
    globalHidden: "global",
    globalRequired: 1,
    foo: true,
    fooPrefixed: "foo",
    fooHidden: "foo",
    fooRequired: 1,
  });
  clearEnv();
});

test("[command] - env var - expect option to throw if value is not a boolean", async () => {
  setupEnv();
  setEnv("global", "foo");
  await assertRejects(
    async () => {
      await command().parse([]);
    },
    Error,
    `Environment variable "global" must be of type "boolean", but got "foo".`,
  );
  clearEnv();
});

test("[command] - env var - expect option to throw if value is not a number", async () => {
  setupEnv();
  setEnv("global_required", "foo");
  await assertRejects(
    async () => {
      await command().parse([]);
    },
    Error,
    `Environment variable "global_required" must be of type "number", but got "foo".`,
  );
  clearEnv();
});

test("[command] - env var - expect global option to throw if value is not a boolean", async () => {
  setupEnv();
  setEnv("global", "foo");
  await assertRejects(
    async () => {
      await command().parse(["bar"]);
    },
    Error,
    `Environment variable "global" must be of type "boolean", but got "foo".`,
  );
  clearEnv();
});

test("[command] - env var - expect global option to throw if value is not a number", async () => {
  setupEnv();
  setEnv("global_required", "foo");
  await assertRejects(
    async () => {
      await command().parse(["bar"]);
    },
    Error,
    `Environment variable "global_required" must be of type "number", but got "foo".`,
  );
  clearEnv();
});

test("[command] - env var - env var properties", () => {
  const cmd = new Command()
    .throwErrors()
    .globalEnv("global, global2", "global ...")
    .env("foo, foo2 <bar:string>", "foo ...", {
      hidden: true,
    });

  const globalEnvVar: EnvVar = cmd.getEnvVar("global") as EnvVar;
  const fooEnvVar: EnvVar = cmd.getEnvVar("foo", true) as EnvVar;

  assertEquals(globalEnvVar.name, "global");
  assertEquals(globalEnvVar.names, ["global", "global2"]);
  assertEquals(globalEnvVar.description, "global ...");
  assertEquals(globalEnvVar.global, true);
  assertEquals(globalEnvVar.type, "boolean");
  assertEquals(globalEnvVar.hidden, undefined);

  assertEquals(fooEnvVar.name, "foo");
  assertEquals(fooEnvVar.names, ["foo", "foo2"]);
  assertEquals(fooEnvVar.description, "foo ...");
  assertEquals(fooEnvVar.global, undefined);
  assertEquals(fooEnvVar.type, "string");
  assertEquals(fooEnvVar.hidden, true);
});

test("[command] - env var - has env vars", () => {
  const cmd = command();
  assertEquals(cmd.hasEnvVars(), true);
  assertEquals(cmd.hasEnvVars(true), true);
  assertEquals(new Command().hasEnvVars(), false);
  assertEquals(new Command().hasEnvVars(true), false);
});

test("[command] - env var - get env vars", () => {
  const cmd = command();
  assertEquals(cmd.getEnvVars().map((env) => env.name), [
    "global",
    "global_required",
    "prefix_global_prefixed",
    "foo",
    "foo_required",
    "prefix_foo_prefixed",
  ]);
  assertEquals(cmd.getEnvVars(true).map((env) => env.name), [
    "global",
    "global_hidden",
    "global_required",
    "prefix_global_prefixed",
    "foo",
    "foo_hidden",
    "foo_required",
    "prefix_foo_prefixed",
  ]);
});

test("[command] - env var - get base env vars", () => {
  const cmd = command();
  assertEquals(cmd.getBaseEnvVars().map((env) => env.name), [
    "global",
    "global_required",
    "prefix_global_prefixed",
    "foo",
    "foo_required",
    "prefix_foo_prefixed",
  ]);
  assertEquals(cmd.getBaseEnvVars(true).map((env) => env.name), [
    "global",
    "global_hidden",
    "global_required",
    "prefix_global_prefixed",
    "foo",
    "foo_hidden",
    "foo_required",
    "prefix_foo_prefixed",
  ]);
});

test("[command] - env var - get global env vars", () => {
  const cmd = command().getCommand("bar") as Command;
  assertEquals(cmd.getGlobalEnvVars().map((env) => env.name), [
    "global",
    "global_required",
    "prefix_global_prefixed",
  ]);
  assertEquals(cmd.getGlobalEnvVars(true).map((env) => env.name), [
    "global",
    "global_hidden",
    "global_required",
    "prefix_global_prefixed",
  ]);
});

test("[command] - env var - has env var", () => {
  const cmd = command();
  assertEquals(cmd.hasEnvVar("global"), true);
  assertEquals(cmd.hasEnvVar("global_hidden"), false);
  assertEquals(cmd.hasEnvVar("global_hidden", true), true);
  assertEquals(cmd.hasEnvVar("foo"), true);
  assertEquals(cmd.hasEnvVar("foo_hidden"), false);
  assertEquals(cmd.hasEnvVar("foo_hidden", true), true);
  assertEquals(cmd.hasEnvVar("unknown"), false);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("global"), true);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("global_hidden"), false);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("global_hidden", true), true);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("bar"), true);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("bar_hidden"), false);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("bar_hidden", true), true);
  assertEquals(cmd.getCommand("bar")?.hasEnvVar("unknown"), false);
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("global"),
    true,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("global_hidden"),
    false,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("global_hidden", true),
    true,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("baz"),
    true,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("baz_hidden"),
    false,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("baz_hidden", true),
    true,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.hasEnvVar("unknown"),
    false,
  );
});

test("[command] - env var - get env var", () => {
  const cmd = command();
  assertEquals(cmd.getEnvVar("global")?.name, "global");
  assertEquals(cmd.getEnvVar("global_hidden")?.name, undefined);
  assertEquals(cmd.getEnvVar("global_hidden", true)?.name, "global_hidden");
  assertEquals(cmd.getEnvVar("foo")?.name, "foo");
  assertEquals(cmd.getEnvVar("foo_hidden")?.name, undefined);
  assertEquals(cmd.getEnvVar("foo_hidden", true)?.name, "foo_hidden");
  assertEquals(cmd.getEnvVar("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getEnvVar("global")?.name, "global");
  assertEquals(
    cmd.getCommand("bar")?.getEnvVar("global_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getEnvVar("global_hidden", true)?.name,
    "global_hidden",
  );
  assertEquals(cmd.getCommand("bar")?.getEnvVar("bar")?.name, "bar");
  assertEquals(cmd.getCommand("bar")?.getEnvVar("bar_hidden")?.name, undefined);
  assertEquals(
    cmd.getCommand("bar")?.getEnvVar("bar_hidden", true)?.name,
    "bar_hidden",
  );
  assertEquals(cmd.getCommand("bar")?.getEnvVar("unknown")?.name, undefined);
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("global")?.name,
    "global",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("global_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("global_hidden", true)
      ?.name,
    "global_hidden",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("baz")?.name,
    "baz",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("baz_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("baz_hidden", true)
      ?.name,
    "baz_hidden",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getEnvVar("unknown")?.name,
    undefined,
  );
});

test("[command] - env var - get base env var", () => {
  const cmd = command();
  assertEquals(cmd.getBaseEnvVar("global")?.name, "global");
  assertEquals(cmd.getBaseEnvVar("global_hidden")?.name, undefined);
  assertEquals(cmd.getBaseEnvVar("global_hidden", true)?.name, "global_hidden");
  assertEquals(cmd.getBaseEnvVar("foo")?.name, "foo");
  assertEquals(cmd.getBaseEnvVar("foo_hidden")?.name, undefined);
  assertEquals(cmd.getBaseEnvVar("foo_hidden", true)?.name, "foo_hidden");
  assertEquals(cmd.getBaseEnvVar("unknown")?.name, undefined);
  assertEquals(cmd.getCommand("bar")?.getBaseEnvVar("global")?.name, undefined);
  assertEquals(
    cmd.getCommand("bar")?.getBaseEnvVar("global_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getBaseEnvVar("global_hidden", true)?.name,
    undefined,
  );
  assertEquals(cmd.getCommand("bar")?.getBaseEnvVar("bar")?.name, "bar");
  assertEquals(
    cmd.getCommand("bar")?.getBaseEnvVar("bar_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getBaseEnvVar("bar_hidden", true)?.name,
    "bar_hidden",
  );
  assertEquals(
    cmd.getCommand("bar")?.getBaseEnvVar("unknown")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar("global")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar("global_hidden")
      ?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar(
      "global_hidden",
      true,
    )?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar("baz")?.name,
    "baz",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar("baz_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar("baz_hidden", true)
      ?.name,
    "baz_hidden",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getBaseEnvVar("unknown")?.name,
    undefined,
  );
});

test("[command] - env var - get global env var", () => {
  const cmd = command();
  assertEquals(cmd.getGlobalEnvVar("global")?.name, undefined);
  assertEquals(cmd.getGlobalEnvVar("global_hidden")?.name, undefined);
  assertEquals(cmd.getGlobalEnvVar("global_hidden", true)?.name, undefined);
  assertEquals(cmd.getGlobalEnvVar("foo")?.name, undefined);
  assertEquals(cmd.getGlobalEnvVar("foo_hidden")?.name, undefined);
  assertEquals(cmd.getGlobalEnvVar("foo_hidden", true)?.name, undefined);
  assertEquals(cmd.getGlobalEnvVar("unknown")?.name, undefined);
  assertEquals(
    cmd.getCommand("bar")?.getGlobalEnvVar("global")?.name,
    "global",
  );
  assertEquals(
    cmd.getCommand("bar")?.getGlobalEnvVar("global_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getGlobalEnvVar("global_hidden", true)?.name,
    "global_hidden",
  );
  assertEquals(cmd.getCommand("bar")?.getGlobalEnvVar("bar")?.name, undefined);
  assertEquals(
    cmd.getCommand("bar")?.getGlobalEnvVar("bar_hidden")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getGlobalEnvVar("bar_hidden", true)?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getGlobalEnvVar("unknown")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar("global")?.name,
    "global",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar("global_hidden")
      ?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar(
      "global_hidden",
      true,
    )?.name,
    "global_hidden",
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar("baz")?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar("baz_hidden")
      ?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar(
      "baz_hidden",
      true,
    )?.name,
    undefined,
  );
  assertEquals(
    cmd.getCommand("bar")?.getCommand("baz")?.getGlobalEnvVar("unknown")?.name,
    undefined,
  );
});

test({
  name: "[command] - env var - should override default value from option",
  async fn() {
    setEnv("FOO_BAR", "baz");
    const { options } = await new Command()
      .env("FOO_BAR=<val>", "...", { prefix: "FOO_" })
      .option("--bar <val>", "...", { default: "beep" })
      .parse([]);
    deleteEnv("FOO_BAR");
    assertEquals(options, { bar: "baz" });
  },
});

test({
  name: "[command] - env var - should parse list type",
  async fn() {
    setEnv("FOO_BAR", "1,2,3");
    setEnv("FOO_BAR_BAZ", "1,2,3");
    const { options } = await new Command()
      .type("test", (type) => [type.value + "!"])
      .env("FOO_BAR=<val:number[]>", "...")
      .env("FOO_BAR_BAZ=<val2:test[]>", "...")
      .parse([]);
    deleteEnv("FOO_BAR");
    deleteEnv("FOO_BAR_BAZ");
    assertEquals(options, {
      fooBar: [1, 2, 3],
      fooBarBaz: [["1!"], ["2!"], ["3!"]],
    });
  },
});

test({
  name: "[command] - env var - should disable global env vars with noGlobals",
  async fn() {
    setEnv("FOO_BAR", "1,2,3");
    setEnv("FOO_BAR_BAZ", "1,2,3");

    const { options } = await new Command()
      .globalType("test", (type) => [type.value + "!"])
      .globalEnv("FOO_BAR=<val:number[]>", "...")
      .globalEnv("FOO_BAR_BAZ=<val2:test[]>", "...")
      .command("biz")
      .noGlobals()
      .env("beep", "...")
      .parse(["biz"]);

    deleteEnv("FOO_BAR");
    deleteEnv("FOO_BAR_BAZ");

    assertEquals(options, {});
  },
});

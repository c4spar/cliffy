import { test } from "@cliffy/internal/testing/test";
import {
  assertEquals,
  assertNotMatch,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { stripAnsiCode } from "@std/fmt/colors";
import { Command } from "../../command.ts";
import { withEnv } from "@cliffy/internal/testing/with-env";

function command() {
  return new Command().noExit();
}

test(
  "should read the option value from a derived env var name",
  withEnv({ INSTALL_ROOT: "/from-env" }, async () => {
    const { options } = await command()
      .option("--install-root <path:string>", "...", { env: true })
      .parse([]);

    assertEquals(options, { installRoot: "/from-env" });
  }),
);

test(
  "should derive the same env var name from a camel case flag",
  withEnv({ INSTALL_ROOT: "/from-env" }, async () => {
    const { options } = await command()
      .option("--installRoot <path:string>", "...", { env: true })
      .parse([]);

    assertEquals(options, { installRoot: "/from-env" });
  }),
);

test(
  "should read the option value from an explicit env var name",
  withEnv({ DENO_INSTALL_ROOT: "/from-env" }, async () => {
    const { options } = await command()
      .option("--install-root <path:string>", "...", {
        env: "DENO_INSTALL_ROOT",
      })
      .parse([]);

    assertEquals(options, { installRoot: "/from-env" });
  }),
);

test(
  "should read the option value from a prefixed env var name",
  withEnv({ DENO_INSTALL_ROOT: "/from-env" }, async () => {
    const { options } = await command()
      .option("--install-root <path:string>", "...", {
        env: { prefix: "DENO_" },
      })
      .parse([]);

    assertEquals(options, { installRoot: "/from-env" });
  }),
);

test(
  "should read the env var for a short only option from an explicit name",
  withEnv({ FORCE: "true" }, async () => {
    const { options } = await command()
      .option("-f", "...", { env: "FORCE" })
      .parse([]);

    assertEquals(options, { f: true });
  }),
);

test(
  "should let the command line flag override the env var",
  withEnv({ INSTALL_ROOT: "/from-env" }, async () => {
    const { options } = await command()
      .option("--install-root <path:string>", "...", { env: true })
      .parse(["--install-root", "/from-flag"]);

    assertEquals(options, { installRoot: "/from-flag" });
  }),
);

test(
  "should let the env var override the default value",
  withEnv({ INSTALL_ROOT: "/from-env" }, async () => {
    const { options } = await command()
      .option("--install-root <path:string>", "...", {
        env: true,
        default: "/default",
      })
      .parse([]);

    assertEquals(options, { installRoot: "/from-env" });
  }),
);

test("should fall back to the default value when the env var is unset", async () => {
  const { options } = await command()
    .option("--install-root <path:string>", "...", {
      env: true,
      default: "/default",
    })
    .parse([]);

  assertEquals(options, { installRoot: "/default" });
});

test(
  "should parse the env var value using the option type",
  withEnv({ PORT: "8080" }, async () => {
    const { options } = await command()
      .option("--port <port:number>", "...", { env: true })
      .parse([]);

    assertEquals(options, { port: 8080 });
  }),
);

test(
  "should throw with the env var name when the value has the wrong type",
  withEnv({ PORT: "abc" }, async () => {
    await assertRejects(
      () =>
        command()
          .option("--port <port:number>", "...", { env: true })
          .parse([]),
      Error,
      `Environment variable "PORT" must be of type "number"`,
    );
  }),
);

test(
  "should apply the option value handler to the env var value",
  withEnv({ NAME: "abc" }, async () => {
    const { options } = await command()
      .option("--name <name:string>", "...", {
        env: true,
        value: (value: string) => value.toUpperCase(),
      })
      .parse([]);

    assertEquals(options, { name: "ABC" });
  }),
);

test(
  "should satisfy a required option from the env var",
  withEnv({ TOKEN: "secret" }, async () => {
    const { options } = await command()
      .option("--token <token:string>", "...", { env: true, required: true })
      .parse([]);

    assertEquals(options, { token: "secret" });
  }),
);

test("should throw for a required option when neither flag nor env var is set", async () => {
  await assertRejects(
    () =>
      command()
        .option("--token <token:string>", "...", { env: true, required: true })
        .parse([]),
    Error,
    `Missing required option "--token"`,
  );
});

test(
  "should split a list env var value using the option separator",
  withEnv({ TAGS: "a;b;c" }, async () => {
    const { options } = await command()
      .option("--tags <tags:string[]>", "...", { env: true, separator: ";" })
      .parse([]);

    assertEquals(options, { tags: ["a", "b", "c"] });
  }),
);

test(
  "should read a boolean flag from the env var",
  withEnv({ VERBOSE: "true" }, async () => {
    const { options } = await command()
      .option("--verbose", "...", { env: true })
      .parse([]);

    assertEquals(options, { verbose: true });
  }),
);

test(
  "should invert a negatable option env var value",
  withEnv({ NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .option("--no-color", "...", { env: true })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should resolve a negatable option env var to true when set to false",
  withEnv({ NO_COLOR: "false" }, async () => {
    const { options } = await command()
      .option("--no-color", "...", { env: true })
      .parse([]);

    assertEquals(options, { color: true });
  }),
);

test(
  "should invert a negatable option env var with a prefixed name",
  withEnv({ DENO_NO_COLOR: "true" }, async () => {
    const { options } = await command()
      .option("--no-color", "...", { env: { prefix: "DENO_" } })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should invert a negatable option env var with an explicit name",
  withEnv({ DISABLE_COLOR: "true" }, async () => {
    const { options } = await command()
      .option("--no-color", "...", { env: "DISABLE_COLOR" })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should inherit a global option env var in sub commands",
  withEnv({ GLOBAL_TOKEN: "secret" }, async () => {
    const { options } = await command()
      .globalOption("--global-token <token:string>", "...", { env: true })
      .command("sub", command().option("--foo <foo:string>", "..."))
      .parse(["sub"]);

    assertEquals(options, { globalToken: "secret" });
  }),
);

test("should list a linked env var and show the hint on the option", () => {
  const help = stripAnsiCode(
    command()
      .name("deno")
      .description("...")
      .option("--install-root <path:string>", "Set install root.", {
        env: true,
      })
      .getHelp(),
  );

  assertStringIncludes(help, "--install-root  <path>");
  assertStringIncludes(help, "(env: INSTALL_ROOT)");
  assertStringIncludes(help, "Environment variables:");
  assertStringIncludes(help, "INSTALL_ROOT  <path>");
});

test("should hide a linked env var when the option is hidden", () => {
  const help = stripAnsiCode(
    command()
      .name("deno")
      .description("...")
      .option("--secret <value:string>", "...", { env: true, hidden: true })
      .getHelp(),
  );

  assertNotMatch(help, /secret/i);
  assertNotMatch(help, /Environment variables/);
});

test("should throw when deriving an env var name for a short-only option", () => {
  assertThrows(
    () => command().option("-f", "...", { env: true }),
    Error,
    `Cannot link an environment variable to option "-f"`,
  );
});

test("should throw when linking an env var to a dotted option", () => {
  assertThrows(
    () => command().option("--foo.bar <value:string>", "...", { env: true }),
    Error,
    `Cannot link an environment variable to option "--foo.bar"`,
  );
});

test("should throw when linking an env var to a non-boolean negatable option", () => {
  assertThrows(
    () => command().option("--no-check <value:string>", "...", { env: true }),
    Error,
    `Cannot link an environment variable to option "--no-check"`,
  );
});

test("should throw when linking an env var to a variadic option", () => {
  assertThrows(
    () => command().option("--tags <tags...:string>", "...", { env: true }),
    Error,
    `An environment variable cannot have an variadic value, but "--tags" is defined as variadic.`,
  );
});

test("should throw when linking an env var to an option with more than one value", () => {
  assertThrows(
    () =>
      command().option("--pair <a:string> <b:string>", "...", { env: true }),
    Error,
    `An environment variable can only have one value, but "--pair" has more than one.`,
  );
});

test("should throw when the derived env var name is already registered", () => {
  assertThrows(
    () =>
      command()
        .env("FOO=<value:string>", "...")
        .option("--foo <value:string>", "...", { env: true }),
    Error,
    `Environment variable with name "FOO" already exists.`,
  );
});

test(
  "should read the env var of an option as the type of the `type` option",
  withEnv({ NO_COLOR: "whatever" }, async () => {
    const { options } = await command()
      .option("--no-color", "...", { env: { type: "presence" } })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test(
  "should not parse the value of a presence typed env var",
  withEnv({ NO_COLOR: "false" }, async () => {
    const { options } = await command()
      .option("--no-color", "...", { env: { type: "presence" } })
      .parse([]);

    assertEquals(options, { color: false });
  }),
);

test("should keep the option itself valueless when the env type is set", async () => {
  await assertRejects(
    () =>
      command()
        .throwErrors()
        .option("--no-color", "...", { env: { type: "presence" } })
        .parse(["--no-color=true"]),
    Error,
    `Option "--no-color" doesn't take a value, but got "true".`,
  );
});

test(
  "should combine the `type` and `prefix` env options",
  withEnv({ MYCLI_NO_CACHE: "1" }, async () => {
    const { options } = await command()
      .option("--no-cache", "...", {
        env: { prefix: "MYCLI_", type: "presence" },
      })
      .parse([]);

    assertEquals(options, { cache: false });
  }),
);

test(
  "should read the env var of an option with any type",
  withEnv({ PORT: "80" }, async () => {
    const { options } = await command()
      .option("--port <port:string>", "...", { env: { type: "number" } })
      .parse([]);

    assertEquals(options, { port: 80 });
  }),
);

test("should infer the value of the env type", async () => {
  const { options } = await command()
    .option("--port <port:string>", "...", { env: { type: "number" } })
    .parse([]);

  assertType<
    IsExact<typeof options, { port?: string | number | undefined }>
  >(true);
});

test("should not widen the option type for a matching env type", async () => {
  const { options } = await command()
    .option("--no-color", "...", { env: { type: "presence" } })
    .parse([]);

  assertType<IsExact<typeof options, { color: boolean }>>(true);
});

test("should not widen the option type without an env type", async () => {
  const { options } = await command()
    .option("--cache <dir:string>", "...", { env: true })
    .parse([]);

  assertType<IsExact<typeof options, { cache?: string | undefined }>>(true);
});

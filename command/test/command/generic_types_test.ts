import { test } from "@cliffy/internal/testing/test";
import { Command, EnumType } from "../../mod.ts";
import { assertType, type IsAny, type IsExact } from "@std/testing/types";

// Not required to execute this code, only type check.
(() => {
  test({
    name:
      "[command] - generic types - options and args should be of type any bay default",
    fn() {
      // deno-lint-ignore no-explicit-any
      new Command<any>()
        .action((options, ...args) => {
          assertType<IsAny<typeof options>>(true);
          // deno-lint-ignore no-explicit-any
          assertType<IsExact<typeof args, Array<any>>>(true);
        });
    },
  });

  test({
    name:
      "[command] - generic types - options and args should be of type any with options and arguments",
    fn() {
      // deno-lint-ignore no-explicit-any
      new Command<any>()
        .option("-f, --foo, [val:string]", "...")
        .arguments("<val:string> [val:string]")
        .env("FOO_BAR <val:number>", "")
        .action((options, ...args) => {
          assertType<IsAny<typeof options>>(true);
          // deno-lint-ignore no-explicit-any
          assertType<IsExact<typeof args, Array<any>>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - command with void options",
    fn() {
      new Command()
        .action((options, ...args) => {
          assertType<IsExact<typeof options, void>>(true);
          assertType<IsExact<typeof args, []>>(true);
        })
        .command("foo", new Command())
        .action((options, ...args) => {
          assertType<IsExact<typeof options, void>>(true);
          assertType<IsExact<typeof args, []>>(true);
        })
        .command("bar", new Command<void>())
        .action((options, ...args) => {
          assertType<IsExact<typeof options, void>>(true);
          assertType<IsExact<typeof args, []>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - command with void options and arguments",
    fn() {
      new Command<void, void, void, []>()
        .action((options, ...args) => {
          assertType<IsExact<typeof options, void>>(true);
          assertType<IsExact<typeof args, []>>(true);
        });
    },
  });

  test({
    name:
      "[command] - generic types - command with void options and predefined arguments",
    fn() {
      new Command<void, void, void, [number]>()
        .action((options, ...args) => {
          assertType<IsExact<typeof options, void>>(true);
          assertType<IsExact<typeof args, [number]>>(true);
        });
    },
  });

  test({
    name:
      "[command] - generic types - command with predefined options and arguments",
    fn() {
      new Command<
        void,
        void,
        { foo?: boolean },
        [bar?: number],
        { bar?: true }
      >()
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [bar?: number]>>(true);
          assertType<
            IsExact<typeof options, {
              bar?: true;
              foo?: boolean;
            }>
          >(true);
        });
    },
  });

  test({
    name:
      "[command] - generic types - pre-defined constructor types with options",
    fn() {
      type Arguments = [input: string, output?: string, level?: number];
      type Options = {
        name: string;
        age: number;
        email?: string;
      };
      type GlobalOptions = {
        debug?: true;
        debugLevel: "debug" | "info" | "warn" | "error";
      };

      new Command<void, void, Options, Arguments, GlobalOptions>()
        .arguments("<input:string> [output:string] [level:number]")
        .globalOption("-d, --debug", "description ...")
        .globalOption("-l, --debug-level <string>", "description ...", {
          default: "warn",
        })
        .option("-n, --name <name:string>", "description ...", {
          required: true,
        })
        .option("-a, --age <age:number>", "description ...", { required: true })
        .option("-e, --email <email:string>", "description ...")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [string, string?, number?]>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              debugLevel: "debug" | "info" | "warn" | "error";
              name: string;
              age: number;
              email?: string;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - chained command",
    fn() {
      const cmd = new Command()
        .versionOption("-V, --versionx", "")
        .option("--main", "")
        .globalOption("--debug", "", {
          action: (options, ...args) => {
            assertType<IsExact<typeof args, []>>(true);
            assertType<
              IsExact<typeof options, {
                debug?: true;
                // logLevel?: true;
                main?: true;
              }>
            >(true);
          },
        })
        .option("--log-level", "", {
          global: true,
          action: (options, ...args) => {
            assertType<IsExact<typeof args, []>>(true);
            assertType<
              IsExact<typeof options, {
                debug?: true;
                logLevel?: true;
                main?: true;
              }>
            >(true);
          },
        })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              main?: true;
            }>
          >(true);
        });

      cmd.command("foo")
        .globalOption("--foo-global", "")
        .option("--foo", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              fooGlobal?: true;
              foo?: true;
            }>
          >(true);
        });

      cmd.command("bar")
        .globalOption("--bar-global", "")
        .option("--bar", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              barGlobal?: true;
              bar?: true;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - add child commands",
    fn() {
      const foo = new Command<{ debug?: true; logLevel?: true }>()
        .globalOption("--foo-global", "")
        .option("--foo", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              fooGlobal?: true;
              foo?: true;
            }>
          >(true);
        })
        .command("bar-bar")
        .command("foo-foo")
        .globalOption("--foo-foo-global", "")
        .option("--foo-foo", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              fooGlobal?: true;
              fooFooGlobal?: true;
              fooFoo?: true;
            }>
          >(true);
        })
        .select("bar-bar");

      const bar = new Command<{ debug?: true; logLevel?: true }>()
        .globalOption("--bar-global", "")
        .option("--bar", "")
        .versionOption("--versionx", "", {
          global: true,
          action(options, ...args) {
            assertType<IsExact<typeof args, []>>(true);
            assertType<
              IsExact<typeof options, {
                debug?: true;
                logLevel?: true;
                barGlobal?: true;
                bar?: true;
              }>
            >(true);
          },
        })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              barGlobal?: true;
              bar?: true;
            }>
          >(true);
        });

      // deno-lint-ignore no-explicit-any
      const _main: Command<any> = new Command()
        .arguments("<input> [output:number]")
        .globalOption("--debug", "")
        .globalOption("--log-level", "")
        .option("--main", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [string, number?]>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              main?: true;
            }>
          >(true);
        })
        .command("foo", foo)
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              fooGlobal?: true;
              foo?: true;
            }>
          >(true);
        })
        .command("bar", bar)
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              debug?: true;
              logLevel?: true;
              barGlobal?: true;
              bar?: true;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - simple child command with parent option",
    fn() {
      const fooCommand = new Command<{ main?: true }>();

      new Command()
        .globalOption("--main", "")
        .command("foo", fooCommand);
    },
  });

  test({
    name: "[command] - generic types - child command with parent option",
    fn() {
      const foo = new Command()
        .option("-f, --foo", "");

      const cmd = new Command()
        .globalOption("--main", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              main?: true;
            }>
          >(true);
        })
        .command("1", new Command())
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              main?: true;
            }>
          >(true);
        })
        .command("2", foo)
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              main?: true;
              foo?: true;
            }>
          >(true);
        })
        .command("3", new Command())
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              main?: true;
            }>
          >(true);
        })
        .command("4", new Command<{ main?: true }>());

      // @ts-expect-error unknown global option main2
      cmd.command("5", new Command<{ main2?: true }>());
    },
  });

  test({
    name: "[command] - generic types - unkown parent option on empty command",
    fn() {
      new Command()
        // @ts-expect-error unknown global option main
        .command("foo", new Command<{ main?: true }>());
    },
  });

  test({
    name: "[command] - generic types - unknown parent option",
    fn() {
      new Command()
        .globalOption("--foo", "")
        // @ts-expect-error unknown global option main
        .command("foo", new Command<{ main?: true }>());
    },
  });

  test({
    name: "[command] - generic types - unknown parent option with sub command",
    fn() {
      new Command()
        .globalOption("--foo", "")
        .command(
          "foo",
          // @ts-expect-error unknown global option main
          new Command<{ main?: true }>()
            .command("foo")
            .option("--bar", ""),
        );
    },
  });

  test({
    name: "[command] - generic types - global parent option with sub command",
    fn() {
      new Command()
        .globalOption("--foo", "")
        .command(
          "foo",
          new Command<{ foo?: true }>()
            .command("foo")
            .option("--bar", ""),
        );
    },
  });

  test({
    name: "[command] - generic types - incompatible parent option type",
    fn() {
      const fooCommand = new Command<{ main?: number }>();

      new Command()
        .globalOption("--main", "")
        // @ts-expect-error main option has incompatible type
        .command("foo", fooCommand);
    },
  });

  test({
    name:
      "[command] - generic types - unkown parent option on command with global option",
    fn() {
      const fooCommand = new Command<{ main2?: true }>();

      new Command()
        .option("-d, --debug", "...", { global: true })
        // @ts-expect-error unknown global option main2
        .command("foo", fooCommand);
    },
  });

  test({
    name:
      "[command] - generic types - unkown parent option on command with global option 2",
    fn() {
      const fooCommand = new Command<{ main2?: true }>();

      new Command()
        .globalOption("-d, --debug", "...")
        // @ts-expect-error unknown global option main2
        .command("foo", fooCommand);
    },
  });

  test({
    name: "[command] - generic types - simple extended command",
    fn() {
      class Foo extends Command {}

      new Command().command("foo", new Foo());
    },
  });

  test({
    name: "[command] - generic types - extended command",
    fn() {
      class Foo
        extends Command<{ main?: true }, void, { foo?: true }, [string]> {}

      new Command()
        .globalOption("--main", "...")
        .command("foo", new Foo())
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [string]>>(true);
          assertType<
            IsExact<typeof options, {
              main?: true | undefined;
              foo?: true | undefined;
            }>
          >(true);
        });
    },
  });

  test({
    name:
      "[command] - generic types - extended command with incompatible parent option type",
    fn() {
      class Foo extends Command<{ main?: boolean }, void, { foo?: true }, []> {}

      new Command()
        .globalOption("--main", "...")
        // @ts-expect-error boolean is not compatible to true
        .command("foo", new Foo());
    },
  });

  test({
    name: "[command] - generic types - return types",
    fn() {
      new Command()
        .type("color", new EnumType(["red", "blue"]))
        .option("--num [val:number]", "")
        .option("--str [val:string]", "")
        .option("--bool [val:boolean]", "")
        .option("-c, -C, --color, --color-name [val:color]", "")
        .option("--req <val:string>", "", { required: true })
        .option("-f", "")
        .arguments("<arg1:color> [arg2:string]")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, ["red" | "blue", string?]>>(true);
          assertType<
            IsExact<typeof options, {
              color?: true | "red" | "blue";
              num?: number | true;
              str?: string | true;
              bool?: boolean;
              req: string;
              f?: true;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - enabled option",
    fn() {
      const maybeEnabled = Math.random() > 0.5;

      new Command()
        .option("--kept <val:string>", "", { enabled: true })
        .option("--dropped <val:string>", "", { enabled: false })
        .option("--maybe <val:string>", "", { enabled: maybeEnabled })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              kept?: string;
              maybe?: string;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - single enabled option should widen to a single optional type, not distribute into a `{} | { ... }` union",
    fn() {
      const maybeEnabled = Math.random() > 0.5;

      new Command()
        .option("--maybe <val:string>", "", { enabled: maybeEnabled })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<IsExact<typeof options, { maybe?: string }>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - just a variadic arg",
    fn() {
      new Command()
        .arguments("<...args:number>")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [number, ...Array<number>]>>(true);
          assertType<
            IsExact<typeof options, void>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - many arguments",
    fn() {
      enum Lang {
        JS = "js",
        Rust = "rust",
      }
      const colorType = new EnumType(["red", "blue"]);

      new Command()
        .type("color", colorType)
        .type("lang", new EnumType<Lang>(Lang))
        .arguments(
          "<arg1> <arg2:string> <arg3:number> <arg4:boolean> [arg5] [arg6:string] [arg7:number] [arg8:boolean] [arg9:color] [...rest:lang[]]",
        )
        .action((options, ...args) => {
          assertType<
            IsExact<typeof args, [
              string,
              string,
              number,
              boolean,
              string?,
              string?,
              number?,
              boolean?,
              ("red" | "blue")?,
              ...Array<Array<Lang>>,
            ]>
          >(true);
          assertType<IsExact<typeof options, void>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - command arguments",
    fn() {
      const colorType = new EnumType(["red", "blue"]);
      const langType = new EnumType(["js", "rust"]);
      new Command()
        .globalType("color", colorType)
        .globalType("lang", langType)
        .command("foo <arg1:string> [arg2:color] [...rest:lang[]]")
        .action((options, ...args) => {
          assertType<
            IsExact<typeof args, [
              string,
              ("red" | "blue")?,
              ...Array<Array<"js" | "rust">>,
            ]>
          >(true);

          assertType<IsExact<typeof options, void>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - command arguments",
    fn() {
      new Command()
        .command("foo <val:number>")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [number]>>(true);
          assertType<IsExact<typeof options, void>>(true);
        });
    },
  });

  test({
    name:
      "[command] - generic types - command arguments with just a variadic argument",
    fn() {
      new Command()
        .command("foo <...val>")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, [string, ...Array<string>]>>(true);
          assertType<IsExact<typeof options, void>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - command arguments with custom types",
    fn() {
      const colorType = new EnumType(["red", "blue"]);
      const langType = new EnumType(["js", "rust"]);
      new Command()
        .globalType("color", colorType)
        .globalType("lang", langType)
        .command("foo <arg1:string> [arg2:color] [...rest:lang[]]")
        .action((options, ...args) => {
          assertType<
            IsExact<typeof args, [
              string,
              ("red" | "blue")?,
              ...Array<Array<"js" | "rust">>,
            ]>
          >(true);

          assertType<IsExact<typeof options, void>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - environment variables",
    fn() {
      const colorType = new EnumType(["red", "blue"]);
      const langType = new EnumType(["js", "rust"]);
      new Command()
        .globalType("color", colorType)
        .globalType("lang", langType)
        .option("--foo-bar <val:color>", "")
        .env("FOO_BAR <val:color>", "")
        .env("FOO_BAR_BAZ=<val:number>", "", { required: true })
        .globalEnv("GLOBAL_FOO_BAR <val:lang>", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              globalFooBar?: "js" | "rust";
              fooBar?: "red" | "blue";
              fooBarBaz: number;
            }>
          >(true);
        })
        .command("foo")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              globalFooBar?: "js" | "rust";
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - env var prefix",
    fn() {
      new Command()
        .env("FOO_BAR_BAZ=<val:string>", "", { prefix: "FOO_" })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              barBaz?: string;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - option with multiple values",
    fn() {
      new Command()
        .option("--foo-bar <val:string> <val:boolean> [val:number]", "")
        .option("--foo-bar-baz=<val:string> [val:number]", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              fooBar?: [string, boolean, number?];
              fooBarBaz?: [string, number?];
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - option with equal sign",
    fn() {
      new Command()
        .option("--foo-bar=<val:string>", "")
        .option("--foo-bar-baz=<val:string> [val:number]", "")
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              fooBar?: string;
              fooBarBaz?: [string, number?];
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - default value",
    fn() {
      const colorType = new EnumType(["red", "blue"]);
      new Command()
        .type("color", colorType)
        .option("--foo [val:string]", "...")
        .option("--bar [val:string]", "...", { default: 4 })
        .option("--baz <val:color>", "...", { default: "red" })
        .option("--beep <val:string> [val:string]", "...", {
          default: new Date(),
          global: true,
        })
        .globalOption("--boop <val:string> [val:number]", "...", {
          default: new Date(),
        })
        .option("--one.two <val:string>", "...", { default: 4 })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              foo?: string | true;
              bar: string | true | 4;
              baz: "red" | "blue";
              beep: Date | [string, string?];
              boop: Date | [string, number?];
              one: { two: string | 4 };
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - value option",
    fn() {
      new Command()
        .option("--foo [val:string]", "...")
        .option("--bar [val:string]", "...", { default: 4 })
        .option("--baz <val:string>", "...", { default: 4 })
        .option("--beep <val:string> [val:string]", "...", {
          default: new Date(),
          global: true,
          value: (value) => {
            assertType<IsExact<typeof value, Date | [string, string?]>>(true);
            return new Map<string, number>();
          },
        })
        .globalOption("--boop <val:string> [val:string]", "...", {
          default: /.*/g,
          required: true,
          collect: true,
          value(value, val: Array<Date> = []) {
            assertType<IsExact<typeof value, RegExp | [string, string?]>>(true);
            return [...val, new Date()];
          },
        })
        .option("--one.foo <val:string>", "...", {
          default: 4,
          value: (value) => {
            assertType<IsExact<typeof value, string | 4>>(true);
            return new Date();
          },
        })
        .option("--one.bar <val:string>", "...", {
          value: (value) => {
            assertType<IsExact<typeof value, string>>(true);
            return /.*/;
          },
        })
        .option("--three.four <val:string>", "...", {
          value: (value) => {
            assertType<IsExact<typeof value, string>>(true);
            return 2;
          },
        })
        .env("ENV_VAR=<val:number>", "...", {
          required: true,
          value(value) {
            assertType<IsExact<typeof value, number>>(true);
            return new Date();
          },
        })
        .option("--env-var-2 <val:string>", "...", (value) => {
          assertType<IsExact<typeof value, string>>(true);
          return new Date();
        })
        .env("ENV_VAR_2=<val:string>", "...", {
          value(value) {
            assertType<IsExact<typeof value, string>>(true);
            return new Date();
          },
        })
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              beep: Map<string, number>;
              boop: Array<Date>;
              foo?: string | true;
              bar: string | true | 4;
              baz: string | 4;
              one: { foo: Date; bar?: RegExp };
              three?: { four?: number };
              envVar: Date;
              envVar2?: Date;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - collect option",
    fn() {
      new Command()
        .option("--beep <val:string>", "...", {
          collect: true,
        })
        .globalOption("--boop <val:integer>", "...", {
          collect: true,
        })
        .option("--beep2 <val:string>", "...", {
          collect: true,
          // deno-lint-ignore no-inferrable-types
          value: (val: string, prev: string = "") => val + prev,
        })
        .globalOption("--boop2 <val:integer>", "...", {
          collect: false,
          // deno-lint-ignore no-inferrable-types
          value: (val: number, prev: number = 1) => val + prev,
          action(options, ...args) {
            assertType<IsExact<typeof args, []>>(true);
            assertType<
              IsExact<typeof options, {
                beep?: Array<string>;
                boop?: Array<number>;
                beep2?: string;
                boop2?: number;
              }>
            >(true);
          },
        })
        .option(
          "-v, --verbose",
          "Increase debug output.",
          {
            collect: true,
            // deno-lint-ignore no-inferrable-types
            value: (_: number | true, previus: number = 0) => ++previus,
            action(options, ...args) {
              assertType<IsExact<typeof args, []>>(true);
              assertType<
                IsExact<typeof options, {
                  beep?: Array<string>;
                  boop?: Array<number>;
                  beep2?: string;
                  boop2?: number;
                  verbose?: number;
                }>
              >(true);
            },
          },
        )
        .action((options, ...args) => {
          assertType<IsExact<typeof args, []>>(true);
          assertType<
            IsExact<typeof options, {
              beep?: Array<string>;
              boop?: Array<number>;
              beep2?: string;
              boop2?: number;
              verbose?: number;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - negatable option",
    fn() {
      new Command()
        .option("--color <color:string>", "Color name.", { default: "yellow" })
        .option("--no-color", "No color.")
        .option("--no-check", "No check.")
        .option("--remote <url:string>", "Remote url.", { depends: ["color"] })
        .option("--no-remote", "No remote.")
        .option("--no-default-value", "No remote.", { default: 5 })
        .action((options) => {
          assertType<
            IsExact<typeof options, {
              color: string | false;
              check: boolean;
              remote?: string | false;
              defaultValue: false | 5;
            }>
          >(true);
        });
    },
  });

  test({
    name: "[command] - generic types - parse() return value",
    async fn() {
      const { args, cmd, literal, options } = await new Command()
        .throwErrors()
        .option("--foo", "...")
        .option("--bar <value:number>", "...")
        .option("--barbaz <value:number>", "...", {
          value: (value) => new Date(value),
        })
        .arguments("<foo:string> [bar:number]")
        .parse(["abc"]);

      assertType<IsExact<typeof args, [string, number?]>>(true);
      assertType<
        IsExact<
          typeof cmd,
          Command<
            void,
            void,
            {
              foo?: true;
              bar?: number;
              barbaz?: Date;
            },
            [string, number?],
            void,
            {
              number: number;
              integer: number;
              string: string;
              boolean: boolean;
              file: string;
              secret: string;
            },
            void,
            undefined
          >
        >
      >(true);
      assertType<IsExact<typeof literal, Array<string>>>(true);
      assertType<
        IsExact<typeof options, {
          foo?: true;
          bar?: number;
          barbaz?: Date;
        }>
      >(true);
    },
  });

  test({
    name:
      "[command] - generic types - parse() return value with child commands",
    async fn() {
      const { args, cmd, literal, options } = await new Command()
        .option("--foo", "...")
        .option("--bar <value:number>", "...")
        .option("--barbaz <value:number>", "...", {
          value: (value) => new Date(value),
        })
        .command("foo", "...")
        .parse(Deno.args);

      assertType<IsExact<typeof args, Array<unknown>>>(true);
      assertType<
        IsExact<
          typeof cmd,
          Command<
            Record<string, unknown>,
            Record<string, unknown>,
            Record<string, unknown>,
            Array<unknown>,
            Record<string, unknown>,
            Record<string, unknown>,
            Record<string, unknown>,
            undefined
          >
        >
      >(true);
      assertType<IsExact<typeof literal, Array<string>>>(true);
      assertType<IsExact<typeof options, Record<string, unknown>>>(true);
    },
  });

  test({
    name: "[command] - generic types - useRawArgs()",
    fn() {
      new Command()
        .option("-f, --foo, [val:string]", "...")
        .arguments("<val:string> [val:string]")
        .useRawArgs()
        .action((options, ...args) => {
          assertType<IsExact<typeof options, void>>(true);
          assertType<IsExact<typeof args, Array<string>>>(true);
        });
    },
  });

  test({
    name: "[command] - generic types - dotted options",
    fn() {
      new Command()
        .option("--dotted-optional-required.foo <string>", "...")
        .option("--dotted-optional-optional.foo [string]", "...")
        .option("--dotted-optional-boolean.foo", "...")
        //
        .option("--dotted-required-required.foo <string>", "...", {
          required: true,
        })
        .option("--dotted-required-optional.foo [string]", "...", {
          required: true,
        })
        .option("--dotted-required-boolean.foo", "...", {
          required: true,
        })
        //
        .option("--dotted-collect-optional-required.foo <string>", "...", {
          collect: true,
        })
        .option("--dotted-collect-optional-optional.foo [string]", "...", {
          collect: true,
        })
        .option("--dotted-collect-optional-boolean.foo", "...", {
          collect: true,
        })
        //
        .option("--dotted-collect-required-required.foo <string>", "...", {
          collect: true,
          required: true,
        })
        .option("--dotted-collect-required-optional.foo [string]", "...", {
          collect: true,
          required: true,
        })
        .option("--dotted-collect-required-boolean.foo", "...", {
          collect: true,
          required: true,
        })
        .action((options) => {
          assertType<
            IsExact<typeof options, {
              dottedOptionalRequired?: Partial<Record<"foo", string>>;
              dottedOptionalOptional?: Partial<Record<"foo", string | true>>;
              dottedOptionalBoolean?: Partial<Record<"foo", true>>;
              //
              dottedRequiredRequired: Record<"foo", string>;
              dottedRequiredOptional: Record<"foo", string | true>;
              dottedRequiredBoolean: Record<"foo", true>;
              //
              dottedCollectOptionalRequired?: Partial<
                Record<"foo", Array<string>>
              >;
              dottedCollectOptionalOptional?: Partial<
                Record<"foo", Array<string | true>>
              >;
              dottedCollectOptionalBoolean?: Partial<
                Record<"foo", Array<true>>
              >;
              //
              dottedCollectRequiredRequired: Record<"foo", Array<string>>;
              dottedCollectRequiredOptional: Record<
                "foo",
                Array<string | true>
              >;
              dottedCollectRequiredBoolean: Record<"foo", Array<true>>;
            }>
          >(true);
        });
    },
  });
});

test({
  name: "[command] - generic types - nested dotted options",
  fn() {
    new Command()
      .option("--dotted.optional.required.foo <string>", "...")
      .option("--dotted.optional.optional.foo [string]", "...")
      .option("--dotted.optional.boolean.foo", "...")
      //
      .option("--dotted.required.required.foo <string>", "...", {
        required: true,
      })
      .option("--dotted.required.optional.foo [string]", "...", {
        required: true,
      })
      .option("--dotted.required.boolean.foo", "...", {
        required: true,
      })
      //
      .option("--dotted.collect.optional.required.foo <string>", "...", {
        collect: true,
      })
      .option("--dotted.collect.optional.optional.foo [string]", "...", {
        collect: true,
      })
      .option("--dotted.collect.optional.boolean.foo", "...", {
        collect: true,
      })
      //
      .option("--dotted.collect.required.required.foo <string>", "...", {
        collect: true,
        required: true,
      })
      .option("--dotted.collect.required.optional.foo [string]", "...", {
        collect: true,
        required: true,
      })
      .option("--dotted.collect.required.boolean.foo", "...", {
        collect: true,
        required: true,
      })
      .action((options) => {
        assertType<
          IsExact<typeof options, {
            dotted: {
              optional?: {
                required?: Partial<Record<"foo", string>>;
                optional?: Partial<Record<"foo", string | true>>;
                boolean?: Partial<Record<"foo", true>>;
              };
              required: {
                required: Record<"foo", string>;
                optional: Record<"foo", string | true>;
                boolean: Record<"foo", true>;
              };
              collect: {
                optional?: {
                  required?: Partial<Record<"foo", Array<string>>>;
                  optional?: Partial<Record<"foo", Array<string | true>>>;
                  boolean?: Partial<Record<"foo", Array<true>>>;
                };
                required: {
                  required: Record<"foo", Array<string>>;
                  optional: Record<"foo", Array<string | true>>;
                  boolean: Record<"foo", Array<true>>;
                };
              };
            };
          }>
        >(true);
      });
  },
});

test({
  name: "[command] - generic types - wildcard options",
  fn() {
    new Command()
      .option("--wildcard-optional-required.* <string>", "...")
      .option("--wildcard-optional-optional.* [string]", "...")
      .option("--wildcard-optional-boolean.*", "...")
      //
      .option("--wildcard-required-required.* <string>", "...", {
        required: true,
      })
      .option("--wildcard-required-optional.* [string]", "...", {
        required: true,
      })
      .option("--wildcard-required-boolean.*", "...", {
        required: true,
      })
      //
      .option("--wildcard-collect-optional-required.* <string>", "...", {
        collect: true,
      })
      .option("--wildcard-collect-optional-optional.* [string]", "...", {
        collect: true,
      })
      .option("--wildcard-collect-optional-boolean.*", "...", {
        collect: true,
      })
      //
      .option("--wildcard-collect-required-required.* <string>", "...", {
        collect: true,
        required: true,
      })
      .option("--wildcard-collect-required-optional.* [string]", "...", {
        collect: true,
        required: true,
      })
      .option("--wildcard-collect-required-boolean.*", "...", {
        collect: true,
        required: true,
      })
      .action((options) => {
        assertType<
          IsExact<typeof options, {
            wildcardOptionalRequired?: Partial<Record<string, string>>;
            wildcardOptionalOptional?: Partial<Record<string, string | true>>;
            wildcardOptionalBoolean?: Partial<Record<string, true>>;
            //
            wildcardRequiredRequired: Partial<Record<string, string>>;
            wildcardRequiredOptional: Partial<Record<string, string | true>>;
            wildcardRequiredBoolean: Partial<Record<string, true>>;
            //
            wildcardCollectOptionalRequired?: Partial<
              Record<string, Array<string>>
            >;
            wildcardCollectOptionalOptional?: Partial<
              Record<string, Array<string | true>>
            >;
            wildcardCollectOptionalBoolean?: Partial<
              Record<string, Array<true>>
            >;
            //
            wildcardCollectRequiredRequired: Partial<
              Record<string, Array<string>>
            >;
            wildcardCollectRequiredOptional: Partial<
              Record<string, Array<string | true>>
            >;
            wildcardCollectRequiredBoolean: Partial<
              Record<string, Array<true>>
            >;
          }>
        >(true);
      });
  },
});

test({
  name: "[command] - generic types - nested wildcard options",
  fn() {
    new Command()
      .option("--wildcard.optional.required.* <string>", "...")
      .option("--wildcard.optional.optional.* [string]", "...")
      .option("--wildcard.optional.boolean.*", "...")
      //
      .option("--wildcard.required.required.* <string>", "...", {
        required: true,
      })
      .option("--wildcard.required.optional.* [string]", "...", {
        required: true,
      })
      .option("--wildcard.required.boolean.*", "...", {
        required: true,
      })
      //
      .option("--wildcard.collect.optional.required.* <string>", "...", {
        collect: true,
      })
      .option("--wildcard.collect.optional.optional.* [string]", "...", {
        collect: true,
      })
      .option("--wildcard.collect.optional.boolean.*", "...", {
        collect: true,
      })
      //
      .option("--wildcard.collect.required.required.* <string>", "...", {
        collect: true,
        required: true,
      })
      .option("--wildcard.collect.required.optional.* [string]", "...", {
        collect: true,
        required: true,
      })
      .option("--wildcard.collect.required.boolean.*", "...", {
        collect: true,
        required: true,
      })
      .action((options) => {
        assertType<
          IsExact<typeof options, {
            wildcard: {
              optional?: {
                required?: Partial<Record<string, string>>;
                optional?: Partial<Record<string, string | true>>;
                boolean?: Partial<Record<string, true>>;
              };
              required: {
                required: Partial<Record<string, string>>;
                optional: Partial<Record<string, string | true>>;
                boolean: Partial<Record<string, true>>;
              };
              collect: {
                optional?: {
                  required?: Partial<Record<string, Array<string>>>;
                  optional?: Partial<Record<string, Array<string | true>>>;
                  boolean?: Partial<Record<string, Array<true>>>;
                };
                required: {
                  required: Partial<Record<string, Array<string>>>;
                  optional: Partial<Record<string, Array<string | true>>>;
                  boolean: Partial<Record<string, Array<true>>>;
                };
              };
            };
          }>
        >(true);
      });
  },
});

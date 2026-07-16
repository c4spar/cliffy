import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { Command } from "../../command.ts";

function command() {
  return new Command().noExit();
}

test("should use the short flag as the option name when there is no long flag", async () => {
  const { options } = await command()
    .option("-f <value:string>", "...")
    .parse(["-f", "foo"]);

  assertEquals(options, { f: "foo" });
});

test("should use the first short flag as the option name and keep the rest as aliases", async () => {
  const cmd = () => command().option("-f, -x <value:string>", "...");

  assertEquals((await cmd().parse(["-f", "foo"])).options, { f: "foo" });
  assertEquals((await cmd().parse(["-x", "bar"])).options, { f: "bar" });
});

test("should use a short only boolean flag as the option name", async () => {
  const { options } = await command()
    .option("-f", "...")
    .parse(["-f"]);

  assertEquals(options, { f: true });
});

test("should use the long flag as the option name when a short flag precedes it", async () => {
  const { options } = await command()
    .option("-p, --port <port:number>", "...")
    .parse(["-p", "8080"]);

  assertEquals(options, { port: 8080 });
});

test("should expose the short flag as the option name", () => {
  const [option] = command()
    .option("-f, -x <value:string>", "...")
    .getOptions();

  assertEquals(option.name, "f");
  assertEquals(option.aliases, ["x"]);
});

// Not required to execute this code, only type check.
(() => {
  test({
    name: "should type a short only option with the short flag as the property",
    fn() {
      command()
        .option("-f <value:string>", "...")
        .action((options) => {
          assertType<IsExact<typeof options, { f?: string | undefined }>>(true);
        });
    },
  });
})();

import { test } from "@cliffy/internal/testing/test";
import { deleteEnv } from "@cliffy/internal/runtime/delete-env";
import { setEnv } from "@cliffy/internal/runtime/set-env";
import { assertEquals, assertRejects } from "@std/assert";
import { Command } from "../../command.ts";

const cmd = new Command()
  .throwErrors()
  .allowEmpty(false)
  .option("-f, --flag [value:string]", "description ...", { required: true })
  .action(() => {});

test("command optionRequired", async () => {
  const { options, args } = await cmd.parse(["-f", "value"]);

  assertEquals(options, { flag: "value" });
  assertEquals(args, []);
});

test("command optionRequired noArguments", async () => {
  await assertRejects(
    async () => {
      await cmd.parse([]);
    },
    Error,
    `Missing required option "--flag".`,
  );
});

test("should not throw for a missing required option if a matching env var is set", async () => {
  setEnv("FLAG", "env value");
  try {
    const { options, args } = await new Command()
      .throwErrors()
      .option("-f, --flag [value:string]", "description ...", {
        required: true,
      })
      .env("FLAG=<value:string>", "description ...")
      .action(() => {})
      .parse([]);

    assertEquals(options, { flag: "env value" });
    assertEquals(args, []);
  } finally {
    deleteEnv("FLAG");
  }
});

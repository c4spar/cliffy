import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { Command } from "../../command.ts";

const cmd = new Command()
  .throwErrors()
  .option("-o, --optional [value...:number]", "description ...")
  .option("-b, --boolean <value...:boolean>", "description ...")
  .option("-s, --string <value...:string>", "description ...")
  .option("-n, --number <value...:number>", "description ...")
  .option(
    "-v, --variadic-option <value:number> <value:string> [value...:boolean]",
    "description ...",
  )
  .action(() => {});

// Optional:

test("command optionVariadic optional", async () => {
  const { options, args } = await cmd.parse(["-o"]);

  assertEquals(options, { optional: true });
  assertEquals(args, []);
});

// Boolean:

test("command optionVariadic boolean", async () => {
  const { options, args } = await cmd.parse(["-b", "1", "0", "true", "false"]);

  assertEquals(options, { boolean: [true, false, true, false] });
  assertEquals(args, []);
});

test("command optionVariadic booleanInvalidValue", async () => {
  await assertRejects(
    async () => {
      await cmd.parse(["-b", "1", "0", "true", "false", "2"]);
    },
    Error,
    `Option "--boolean" must be of type "boolean", but got "2".`,
  );
});

// String:

test("command optionVariadic string", async () => {
  const { options, args } = await cmd.parse(["-s", "1", "0", "true", "false"]);

  assertEquals(options, { string: ["1", "0", "true", "false"] });
  assertEquals(args, []);
});

// Number:

test("command optionVariadic number", async () => {
  const { options, args } = await cmd.parse(["-n", "1", "0", "654", "1.2"]);

  assertEquals(options, { number: [1, 0, 654, 1.2] });
  assertEquals(args, []);
});

test("command optionVariadic numberInvalidValue", async () => {
  await assertRejects(
    async () => {
      await cmd.parse(["-n", "1", "0", "654", "abc", "1,2"]);
    },
    Error,
    `Option "--number" must be of type "number", but got "abc".`,
  );
});

// Exact:

test("command optionVariadic exact", async () => {
  const { options, args } = await cmd.parse(["-v", "1", "abc", "1"]);

  assertEquals(options, { variadicOption: [1, "abc", true] });
  assertEquals(args, []);
});

test("command optionVariadic exactInvalidValue", async () => {
  await assertRejects(
    async () => {
      await cmd.parse(["-v", "abc", "abc", "1"]);
    },
    Error,
    `Option "--variadic-option" must be of type "number", but got "abc".`,
  );
});

test("command optionVariadic exactMissingValue", async () => {
  await assertRejects(
    async () => {
      await cmd.parse(["-v", "1"]);
    },
    Error,
    `Missing value for option "--variadic-option".`,
  );
});

test("command optionVariadic exactLastOptional", async () => {
  const { options, args } = await cmd.parse(["-v", "1", "abc"]);

  assertEquals(options, { variadicOption: [1, "abc"] });
  assertEquals(args, []);
});

test("command optionVariadic exactLastOptionalVariadic", async () => {
  const { options, args } = await cmd.parse(
    ["-v", "1", "abc", "1", "0", "true", "false"],
  );

  assertEquals(
    options,
    { variadicOption: [1, "abc", true, false, true, false] },
  );
  assertEquals(args, []);
});

test("should allow passing an option after an variadic option", async () => {
  const { options, args } = await new Command()
    .option("-v, --variadic-option <...value:string>", "description ...")
    .option("-s, --string <value:string>", "description ...")
    .parse(["-v", "1", "abc", "-s", "string value"]);

  assertEquals(
    options,
    {
      variadicOption: ["1", "abc"],
      string: "string value",
    },
  );
  assertEquals(args, []);
});

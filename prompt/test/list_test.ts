import { getOs } from "@cliffy/internal/runtime/get-os";
import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { bold, red } from "@std/fmt/colors";
import { List } from "../list.ts";

test('prompt list: , separator option: ","', async () => {
  List.inject("tag1, tag2, tag3");
  const result: string[] | undefined = await List.prompt("message");
  assertEquals(result, ["tag1", "tag2", "tag3"]);
});

test('prompt list: separator option: " "', async () => {
  List.inject("tag1 tag2 tag3");
  const result: string[] | undefined = await List.prompt({
    message: "message",
    separator: " ",
  });
  assertEquals(result, ["tag1", "tag2", "tag3"]);
});

test('prompt list: separator option: ";"', async () => {
  List.inject(" tag tag1 ; tag2 ; tag3 ");
  const result: string[] | undefined = await List.prompt({
    message: "message",
    separator: ";",
  });
  assertEquals(result, ["tag tag1", "tag2", "tag3"]);
});

test('prompt list: separator option: "-"', async () => {
  List.inject(" tag tag1 -tag2-tag3 ");
  const result: string[] | undefined = await List.prompt({
    message: "message",
    separator: "-",
  });
  assertEquals(result, ["tag tag1", "tag2", "tag3"]);
});

test("prompt list: empty value", async () => {
  await assertRejects(
    async () => {
      // deno-lint-ignore no-explicit-any
      List.inject(null as any);
      await List.prompt({
        message: "message",
        minTags: 3,
      });
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt list: min length", async () => {
  await assertRejects(
    async () => {
      List.inject("12");
      await List.prompt({
        message: "message",
        minLength: 3,
      });
    },
    Error,
    red(
      `${
        getOs() === "windows" ? bold("× ") : bold("✘ ")
      }Value must be longer than 3 but has a length of 2.`,
    ),
  );
});

test("prompt list: max length", async () => {
  await assertRejects(
    async () => {
      List.inject("123");
      await List.prompt({
        message: "message",
        maxLength: 2,
      });
    },
    Error,
    red(
      `${
        getOs() === "windows" ? bold("× ") : bold("✘ ")
      }Value can't be longer than 2 but has a length of 3.`,
    ),
  );
});

test("prompt list: min tags", async () => {
  await assertRejects(
    async () => {
      List.inject("");
      await List.prompt({
        message: "message",
        minTags: 3,
      });
    },
    Error,
    red(
      `${
        getOs() === "windows" ? bold("× ") : bold("✘ ")
      }The minimum number of tags is 3 but got 0.`,
    ),
  );
});

test("prompt list: max tags", async () => {
  await assertRejects(
    async () => {
      List.inject("123, 456, 789");
      await List.prompt({
        message: "message",
        maxTags: 2,
      });
    },
    Error,
    red(
      `${
        getOs() === "windows" ? bold("× ") : bold("✘ ")
      }The maximum number of tags is 2 but got 3.`,
    ),
  );
});

// @TODO: add maxLength option to list pormpt
test("prompt list: null value", async () => {
  await assertRejects(
    async () => {
      // deno-lint-ignore no-explicit-any
      List.inject(null as any);
      await List.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

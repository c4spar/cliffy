import { getOs } from "@cliffy/internal/runtime/get-os";
import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { bold, red } from "@std/fmt/colors";
import { Input } from "../input.ts";

test("prompt input: value", async () => {
  Input.inject("hallo");
  const result: string | undefined = await Input.prompt("message");
  assertEquals(result, "hallo");
});

test("prompt input: validate option", async () => {
  Input.inject("foo");
  const result: string | undefined = await Input.prompt({
    message: "message",
    validate: (value) => value.length < 10,
  });
  assertEquals(result, "foo");
});

test("prompt input: default value", async () => {
  Input.inject("");
  const result: string | undefined = await Input.prompt({
    message: "message",
    default: "default",
    validate: (value) => value.length < 10,
  });
  assertEquals(result, "default");
});

test("prompt input: empty value", async () => {
  await assertRejects(
    async () => {
      Input.inject("");
      await Input.prompt({
        message: "message",
        minLength: 8,
      });
    },
    Error,
    red(
      `${
        getOs() === "windows" ? bold("× ") : bold("✘ ")
      }Value must be longer than 8 but has a length of 0.`,
    ),
  );
});

test("prompt input: invalid value", async () => {
  await assertRejects(
    async () => {
      Input.inject("a".repeat(10));
      await Input.prompt({
        message: "message",
        validate: (value) => value.length < 10,
      });
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt input: null value", async () => {
  await assertRejects(
    async () => {
      // deno-lint-ignore no-explicit-any
      Input.inject(null as any);
      await Input.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

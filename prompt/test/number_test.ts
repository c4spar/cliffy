import { getOs } from "@cliffy/internal/runtime/get-os";
import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { bold, red } from "@std/fmt/colors";
import { Number } from "../number.ts";

test("prompt number: value", async () => {
  Number.inject("1");
  const result: number | undefined = await Number.prompt("message");
  assertEquals(result, 1);
});

test("prompt number: negative value", async () => {
  Number.inject("-1");
  const result: number | undefined = await Number.prompt("message");
  assertEquals(result, -1);
});

test("prompt number: number value", async () => {
  Number.inject("0");
  const result: number | undefined = await Number.prompt("message");
  assertEquals(result, 0);
});

test("prompt number: empty value", async () => {
  await assertRejects(
    async () => {
      Number.inject("");
      await Number.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt number: invalid value", async () => {
  await assertRejects(
    async () => {
      Number.inject("abc");
      await Number.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt number: null value", async () => {
  await assertRejects(
    async () => {
      // deno-lint-ignore no-explicit-any
      Number.inject(null as any);
      await Number.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

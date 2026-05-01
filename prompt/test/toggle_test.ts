import { getOs } from "@cliffy/internal/runtime/get-os";
import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { bold, red } from "@std/fmt/colors";
import { Toggle } from "../toggle.ts";

test("prompt toggle: yes", async () => {
  Toggle.inject("Yes");
  const result: boolean | undefined = await Toggle.prompt("message");
  assertEquals(result, true);
});

test("prompt toggle: no", async () => {
  Toggle.inject("No");
  const result: boolean | undefined = await Toggle.prompt("message");
  assertEquals(result, false);
});

test("prompt toggle: empty value", async () => {
  await assertRejects(
    async () => {
      Toggle.inject("");
      await Toggle.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt toggle: invalid value", async () => {
  await assertRejects(
    async () => {
      Toggle.inject("aaa");
      await Toggle.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt toggle: null value", async () => {
  await assertRejects(
    async () => {
      // deno-lint-ignore no-explicit-any
      Toggle.inject(null as any);
      await Toggle.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

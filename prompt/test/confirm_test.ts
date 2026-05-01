import { getOs } from "@cliffy/internal/runtime/get-os";
import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { bold, red } from "@std/fmt/colors";
import { Confirm } from "../confirm.ts";

test("prompt confirm: y", async () => {
  Confirm.inject("y");
  const result: boolean | undefined = await Confirm.prompt("message");
  assertEquals(result, true);
});

test("prompt confirm: yes", async () => {
  Confirm.inject("Yes");
  const result: boolean | undefined = await Confirm.prompt("message");
  assertEquals(result, true);
});

test("prompt confirm: n", async () => {
  Confirm.inject("n");
  const result: boolean | undefined = await Confirm.prompt("message");
  assertEquals(result, false);
});

test("prompt confirm: no", async () => {
  Confirm.inject("No");
  const result: boolean | undefined = await Confirm.prompt("message");
  assertEquals(result, false);
});

test("prompt confirm: empty value", async () => {
  await assertRejects(
    async () => {
      Confirm.inject("");
      await Confirm.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt confirm: invalid value", async () => {
  await assertRejects(
    async () => {
      Confirm.inject("noo");
      await Confirm.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

test("prompt confirm: null value", async () => {
  await assertRejects(
    async () => {
      // deno-lint-ignore no-explicit-any
      Confirm.inject(null as any);
      await Confirm.prompt("message");
    },
    Error,
    red(
      `${getOs() === "windows" ? bold("× ") : bold("✘ ")}Invalid answer.`,
    ),
  );
});

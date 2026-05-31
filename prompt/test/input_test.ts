import { getOs } from "@cliffy/internal/runtime/get-os";
import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { bold, red } from "@std/fmt/colors";
import { Input } from "../input.ts";

class InputTester extends Input {
  get value(): string {
    return this.inputValue;
  }
  set value(v: string) {
    this.inputValue = v;
  }
  get index(): number {
    return this.inputIndex;
  }
  set index(i: number) {
    this.inputIndex = i;
  }
  public override moveWordLeft(): void {
    super.moveWordLeft();
  }
  public override moveWordRight(): void {
    super.moveWordRight();
  }
  public override deleteWordLeft(): void {
    super.deleteWordLeft();
  }
  public override deleteWordRight(): void {
    super.deleteWordRight();
  }
}

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

test("prompt input: should move word left from end of input", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 11;
  t.moveWordLeft();
  assertEquals(t.index, 6);
});

test("prompt input: should move word left from middle of input", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 6;
  t.moveWordLeft();
  assertEquals(t.index, 0);
});

test("prompt input: should not move word left past start", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 0;
  t.moveWordLeft();
  assertEquals(t.index, 0);
});

test("prompt input: should skip leading whitespace when moving word left", () => {
  const t = new InputTester("test");
  t.value = "  hello";
  t.index = 7;
  t.moveWordLeft();
  assertEquals(t.index, 2);
});

test("prompt input: should move word right from start of input", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 0;
  t.moveWordRight();
  assertEquals(t.index, 6);
});

test("prompt input: should move word right to end when no next word", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 6;
  t.moveWordRight();
  assertEquals(t.index, 11);
});

test("prompt input: should not move word right past end", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 11;
  t.moveWordRight();
  assertEquals(t.index, 11);
});

test("prompt input: should skip multiple spaces when moving word right", () => {
  const t = new InputTester("test");
  t.value = "hello  world";
  t.index = 0;
  t.moveWordRight();
  assertEquals(t.index, 7);
});

test("prompt input: should delete word to the left from end", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 11;
  t.deleteWordLeft();
  assertEquals(t.value, "hello ");
  assertEquals(t.index, 6);
});

test("prompt input: should delete word to the left including preceding space", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 6;
  t.deleteWordLeft();
  assertEquals(t.value, "world");
  assertEquals(t.index, 0);
});

test("prompt input: should not delete word to the left at start", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 0;
  t.deleteWordLeft();
  assertEquals(t.value, "hello world");
  assertEquals(t.index, 0);
});

test("prompt input: should delete entire single word to the left", () => {
  const t = new InputTester("test");
  t.value = "hello";
  t.index = 5;
  t.deleteWordLeft();
  assertEquals(t.value, "");
  assertEquals(t.index, 0);
});

test("prompt input: should delete word to the right from start", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 0;
  t.deleteWordRight();
  assertEquals(t.value, "world");
  assertEquals(t.index, 0);
});

test("prompt input: should not delete word to the right at end", () => {
  const t = new InputTester("test");
  t.value = "hello world";
  t.index = 11;
  t.deleteWordRight();
  assertEquals(t.value, "hello world");
  assertEquals(t.index, 11);
});

test("prompt input: should delete entire single word to the right", () => {
  const t = new InputTester("test");
  t.value = "hello";
  t.index = 0;
  t.deleteWordRight();
  assertEquals(t.value, "");
  assertEquals(t.index, 0);
});

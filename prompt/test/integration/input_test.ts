import { ansi } from "@cliffy/ansi";
import { Input } from "../../input.ts";
import { snapshotTest } from "@cliffy/testing";

await snapshotTest({
  name: "input prompt",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should enter some text": { stdin: ["foo bar", "\n"] },
  },
  async fn() {
    await Input.prompt({
      message: "Whats your name?",
      default: "foo",
    });
  },
});

await snapshotTest({
  name: "input prompt with suggestions",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should enable suggestions and list": { stdin: ["foo", "\n"] },
  },
  async fn() {
    await Input.prompt({
      message: "Whats your name?",
      default: "foo",
      suggestions: ["foo", "bar", "baz"],
      list: true,
    });
  },
});

await snapshotTest({
  name:
    "input prompt > should accept the highlighted suggestion on submit when list is enabled",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .cursorDown
    .text("\n")
    .toArray(),
  async fn() {
    const result = await Input.prompt({
      message: "Whats your name?",
      suggestions: ["foo", "bar", "baz"],
      list: true,
    });
    console.log(result);
  },
});

await snapshotTest({
  name:
    "input prompt > should submit the typed value when completeOnSubmit is disabled",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .cursorDown
    .text("\n")
    .toArray(),
  async fn() {
    const result = await Input.prompt({
      message: "Whats your name?",
      suggestions: ["foo", "bar", "baz"],
      list: true,
      completeOnSubmit: false,
    });
    console.log(result);
  },
});

await snapshotTest({
  name:
    "input prompt > should submit the typed value for inline suggestions by default",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("fo")
    .text("\n")
    .toArray(),
  async fn() {
    const result = await Input.prompt({
      message: "Whats your name?",
      suggestions: ["foo", "bar", "baz"],
    });
    console.log(result);
  },
});

await snapshotTest({
  name:
    "input prompt > should submit the typed value when no suggestion matches",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("xyz")
    .text("\n")
    .toArray(),
  async fn() {
    const result = await Input.prompt({
      message: "Whats your name?",
      suggestions: ["foo", "bar", "baz"],
      list: true,
    });
    console.log(result);
  },
});

await snapshotTest({
  name: "input prompt with prefix",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should change prefix": { stdin: ["bar", "\n"] },
  },
  async fn() {
    await Input.prompt({
      message: "Whats your name?",
      default: "foo",
      prefix: "PREFIX ",
    });
  },
});

await snapshotTest({
  name: "input prompt with writer set to stderr",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should enter some text": { stdin: ["foo bar", "\n"] },
  },
  async fn() {
    await Input.prompt({
      message: "Whats your name?",
      default: "foo",
      writer: Deno.stderr,
    });
  },
});

await snapshotTest({
  name: "input prompt without prefix",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should disable prefix": { stdin: ["bar", "\n"] },
  },
  async fn() {
    await Input.prompt({
      message: "Whats your name?",
      default: "foo",
      prefix: "",
    });
  },
});

await snapshotTest({
  name: "input prompt with no location flag",
  meta: import.meta,
  osSuffix: ["windows"],
  steps: {
    "should work without --location flag": { stdin: ["yes", "\n"] },
  },
  async fn() {
    await Input.prompt({
      message: "Works without --location?",
      default: "hope so",
    });
  },
});

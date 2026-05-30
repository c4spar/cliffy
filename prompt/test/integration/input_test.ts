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

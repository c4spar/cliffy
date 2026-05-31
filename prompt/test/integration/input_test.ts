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
    "input prompt > should fuzzy match suggestions in the default search mode",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("abby")
    .text("\t")
    .text("\n")
    .toArray(),
  async fn() {
    await Input.prompt({
      message: "Choose a color",
      suggestions: ["Abbey", "Aqua", "Other"],
      list: true,
      info: true,
    });
  },
});

await snapshotTest({
  name: "input prompt > should restrict suggestions with searchMode substring",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("abby")
    .text("\n")
    .toArray(),
  async fn() {
    await Input.prompt({
      message: "Choose a color",
      suggestions: ["Abbey", "Aqua", "Other"],
      list: true,
      info: true,
      searchMode: "substring",
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
  name:
    "input prompt > should submit the typed value after dismissing the suggestion with escape",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("ab")
    .text("\x1b")
    .text("\n")
    .toArray(),
  async fn() {
    const result = await Input.prompt({
      message: "Whats your name?",
      suggestions: ["abbey", "abbot"],
      list: true,
    });
    console.log(result);
  },
});

await snapshotTest({
  name:
    "input prompt > should show the deselect hint in the info row while a suggestion is highlighted",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("ab")
    .text("\x1b")
    .text("\n")
    .toArray(),
  async fn() {
    const result = await Input.prompt({
      message: "Whats your name?",
      suggestions: ["abbey", "abbot"],
      list: true,
      info: true,
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

await snapshotTest({
  name: "input prompt > should delete word to the left with ctrl+w",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: [
    "hello world",
    "\x17", // ctrl+w
    "\n",
  ],
  async fn() {
    const result = await Input.prompt({ message: "Enter text" });
    console.log(result);
  },
});

await snapshotTest({
  name: "input prompt > should delete word to the right with alt+d",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: [
    "foo bar",
    "\x1b[1;3D", // alt+left (to before "bar")
    "\x1b[1;3D", // alt+left (to before "foo")
    "\x1bd", // alt+d (delete "foo ")
    "\n",
  ],
  async fn() {
    const result = await Input.prompt({ message: "Enter text" });
    console.log(result);
  },
});

await snapshotTest({
  name: "input prompt > should move cursor one word left with alt+left",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: [
    "hello world",
    "\x1b[1;3D", // alt+left (cursor to before "world")
    "X",
    "\n",
  ],
  async fn() {
    const result = await Input.prompt({ message: "Enter text" });
    console.log(result);
  },
});

await snapshotTest({
  name: "input prompt > should move cursor one word right with alt+right",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: [
    "foo",
    "\x1b[1;3D", // alt+left (cursor to before "foo")
    "\x1b[1;3C", // alt+right (cursor back to after "foo")
    "X",
    "\n",
  ],
  async fn() {
    const result = await Input.prompt({ message: "Enter text" });
    console.log(result);
  },
});

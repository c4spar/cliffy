import { ansi } from "@cliffy/ansi";
import { format } from "@std/datetime/format";
import { Select } from "../../select.ts";
import { snapshotTest } from "@cliffy/testing";

await snapshotTest({
  name: "select prompt > should select an option",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .cursorDown
    .cursorDown
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "Baz", value: "baz" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should search an option",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("baz")
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      search: true,
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "Baz", value: "baz" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should fuzzy search an option",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("bz")
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      search: true,
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "Baz", value: "baz" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should typo search an option in all mode",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("structer")
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      search: true,
      options: [
        { name: "structure-builder", value: "structure-builder" },
        { name: "other", value: "other" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should restrict matching with searchMode substring",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("bz")
    .text("\b\b")
    .text("baz")
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      search: true,
      searchMode: "substring",
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "Baz", value: "baz" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should navigate with ctrl+n and ctrl+p when searching",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("\x0e") // ctrl+n: Foo -> Bar
    .text("\x0e") // ctrl+n: Bar -> Baz
    .text("\x10") // ctrl+p: Baz -> Bar
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      search: true,
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "Baz", value: "baz" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should treat h and l as search input",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .text("h")
    .text("t")
    .text("m")
    .text("l")
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Select an option",
      search: true,
      options: [
        { name: "Foo", value: "foo" },
        { name: "Bar", value: "bar" },
        { name: "html", value: "html" },
        { name: "Baz", value: "baz" },
      ],
    });
  },
});

await snapshotTest({
  name: "select prompt > should format option value",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .cursorDown
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Message...",
      options: [
        { value: new Date(10000) },
        { value: new Date(20000) },
      ],
      format: (date) => format(date, "dd-MM-yyyy"),
    });
  },
});

await snapshotTest({
  name: "select prompt > should support separator option",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .cursorDown
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Message...",
      options: [
        { value: new Date(10000) },
        Select.separator("+++++"),
        { value: new Date(20000) },
      ],
      format: (date) => format(date, "dd-MM-yyyy"),
    });
  },
});

await snapshotTest({
  name: "select prompt > should not select disabled option",
  meta: import.meta,
  osSuffix: ["windows"],
  stdin: ansi
    .cursorForward
    .cursorBackward
    .cursorBackward
    .cursorBackward
    .text("\n")
    .toArray(),
  async fn() {
    await Select.prompt({
      message: "Pick a value",
      options: [
        { name: "Value1", value: "value-1", disabled: true },
        { name: "Value2", value: "value-2" },
        { name: "Value3", value: "value-3" },
        { name: "Value4", value: "value-4", disabled: true },
        { name: "Value5", value: "value-5" },
        { name: "Value6", value: "value-6" },
        { name: "Value7", value: "value-7" },
        { name: "Value8", value: "value-8", disabled: true },
        { name: "Value9", value: "value-9", disabled: true },
        { name: "Value10", value: "value-10", disabled: true },
        { name: "Value11", value: "value-11", disabled: true },
        { name: "Value12", value: "value-12", disabled: true },
        { name: "Value13", value: "value-13" },
        { name: "Value14", value: "value-14" },
        { name: "Value15", value: "value-15" },
        { name: "Value16", value: "value-16" },
        { name: "Value17", value: "value-17" },
        { name: "Value18", value: "value-18" },
        { name: "Value19", value: "value-19" },
      ],
    });
  },
});

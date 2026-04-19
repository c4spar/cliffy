import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { parseFlags } from "../../flags.ts";

const flags = [{
  name: "port",
  type: "number",
}, {
  name: "host",
  type: "string",
}, {
  name: "verbose",
  type: "boolean",
  optionalValue: true,
}, {
  name: "tags",
  type: "string",
  list: true,
}];

test("flags - parsedFlags - space form: flag and value as separate tokens", () => {
  const { parsedFlags } = parseFlags(["--port", "80"], { flags });
  assertEquals(parsedFlags, ["--port", "80"]);
});

test("flags - parsedFlags - equals form: flag and value as one token", () => {
  const { parsedFlags } = parseFlags(["--port=80"], { flags });
  assertEquals(parsedFlags, ["--port=80"]);
});

test("flags - parsedFlags - boolean flag with no value", () => {
  const { parsedFlags } = parseFlags(["--verbose"], { flags });
  assertEquals(parsedFlags, ["--verbose"]);
});

test("flags - parsedFlags - multiple flags preserve order", () => {
  const { parsedFlags } = parseFlags(["--port", "80", "--host", "localhost"], {
    flags,
  });
  assertEquals(parsedFlags, ["--port", "80", "--host", "localhost"]);
});

test("flags - parsedFlags - mixed equals and space forms", () => {
  const { parsedFlags } = parseFlags(["--port=80", "--host", "localhost"], {
    flags,
  });
  assertEquals(parsedFlags, ["--port=80", "--host", "localhost"]);
});

test("flags - parsedFlags - list value is a single token", () => {
  const { parsedFlags } = parseFlags(["--tags", "a,b,c"], { flags });
  assertEquals(parsedFlags, ["--tags", "a,b,c"]);
});

test("flags - parsedFlags - list value with equals form", () => {
  const { parsedFlags } = parseFlags(["--tags=a,b,c"], { flags });
  assertEquals(parsedFlags, ["--tags=a,b,c"]);
});

test("flags - parsedFlags - positional args are not included", () => {
  const { parsedFlags } = parseFlags(["hello", "--port", "80", "world"], {
    flags,
    args: [{ name: "first", type: "string" }, {
      name: "second",
      type: "string",
    }],
  });
  assertEquals(parsedFlags, ["--port", "80"]);
});

test("flags - parsedFlags - re-parse from context does not double-count", () => {
  const ctx = parseFlags(["--port", "80"], { flags });
  assertEquals(ctx.parsedFlags, ["--port", "80"]);

  ctx.unknown.push("--host", "localhost");
  const ctx2 = parseFlags(ctx, { flags });
  assertEquals(ctx2.parsedFlags, ["--port", "80", "--host", "localhost"]);
});

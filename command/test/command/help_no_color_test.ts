// deno-lint-ignore no-external-import
import { spawnSync } from "node:child_process";
// deno-lint-ignore no-external-import
import process from "node:process";
import { test } from "@cliffy/internal/testing/test";
import { getExecPath } from "@cliffy/internal/runtime/get-exec-path";
import {
  getRuntimeName,
  type RuntimeName,
} from "@cliffy/internal/runtime/runtime-name";
import { assertEquals, assertNotEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { fromFileUrl } from "@std/path";

const noColorFixture = fromFileUrl(
  new URL("./fixtures/help_no_color.ts", import.meta.url),
);

test("should disable help colors for non-empty NO_COLOR", () => {
  const defaultOutput = runFixture(noColorFixture, "false", "default");
  const explicitOutput = runFixture(noColorFixture, "false", "explicit");

  assertEquals(defaultOutput, stripAnsiCode(defaultOutput));
  assertEquals(explicitOutput, stripAnsiCode(explicitOutput));
});

test("should preserve help colors for empty NO_COLOR", () => {
  const defaultOutput = runFixture(noColorFixture, "", "default");
  const explicitOutput = runFixture(noColorFixture, "", "explicit");

  assertNotEquals(defaultOutput, stripAnsiCode(defaultOutput));
  assertNotEquals(explicitOutput, stripAnsiCode(explicitOutput));
});

test("should enable auto help colors for terminal output", () => {
  const fixture = fromFileUrl(
    new URL("./fixtures/help_auto_colors.ts", import.meta.url),
  );
  const output = runFixture(fixture, "");

  assertNotEquals(output, stripAnsiCode(output));
});

function runFixture(
  fixture: string,
  noColor: string,
  ...args: Array<string>
): string {
  const runtimeArgs: Record<RuntimeName, Array<string>> = {
    deno: ["run", "--allow-env=NO_COLOR", fixture],
    node: [...process.execArgv, fixture],
    bun: [fixture],
  };
  const result = spawnSync(
    getExecPath(),
    [...runtimeArgs[getRuntimeName()], ...args],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        NO_COLOR: noColor,
        NODE_DISABLE_COLORS: "",
      },
    },
  );

  assertEquals(result.status, 0, result.stderr);
  return result.stdout;
}

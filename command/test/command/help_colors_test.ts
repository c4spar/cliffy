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

interface FixtureOptions {
  /** Name of the command to print the help for. */
  command: "default" | "explicit" | "auto";
  /** Value of the `NO_COLOR` environment variable. */
  noColor?: string;
  /** Whether the standard output should be faked as a TTY. */
  terminal?: boolean;
}

const fixture = fromFileUrl(
  new URL("./fixtures/help_colors.ts", import.meta.url),
);

test("should disable help colors for non-empty NO_COLOR", () => {
  assertNoColors(runFixture({ command: "default", noColor: "false" }));
  assertNoColors(runFixture({ command: "explicit", noColor: "false" }));
  assertNoColors(
    runFixture({ command: "auto", noColor: "false", terminal: true }),
  );
});

test("should preserve help colors for empty NO_COLOR", () => {
  assertColors(runFixture({ command: "default" }));
  assertColors(runFixture({ command: "explicit" }));
});

test("should enable auto help colors for terminal output", () => {
  assertColors(runFixture({ command: "auto", terminal: true }));
});

test("should disable auto help colors for piped standard output", () => {
  assertNoColors(runFixture({ command: "auto" }));
});

function runFixture(
  { command, noColor = "", terminal }: FixtureOptions,
): string {
  const runtimeArgs: Record<RuntimeName, Array<string>> = {
    deno: ["run", "--allow-env=NO_COLOR", fixture],
    node: [...process.execArgv, fixture],
    bun: [fixture],
  };
  const args = terminal ? [command, "terminal"] : [command];
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

function assertColors(output: string): void {
  assertNotEquals(output, stripAnsiCode(output), "expected colored output");
}

function assertNoColors(output: string): void {
  assertEquals(output, stripAnsiCode(output), "expected uncolored output");
}

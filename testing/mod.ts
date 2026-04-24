/**
 * An experimental testing module with some helper functions to test command
 * line tools with [Deno](https://deno.com), [Node](https://nodejs.org) and
 * [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/testing).
 *
 * ## Usage
 *
 * ### Snapshot tests
 *
 * The `snapshotTest` method can be used to test `stdin`,`stdout` and `stderr` of a
 * single test case. It injects data to stdin and snapshots the stdout and stderr
 * output of each test case separately.
 *
 * It can also be used to inject arguments to `Deno.args` with the `args` option.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { snapshotTest } from "@cliffy/testing";
 * import { Select } from "@cliffy/prompt/select";
 * import { ansi } from "@cliffy/ansi";
 *
 * await snapshotTest({
 *   name: "should select a color",
 *   meta: import.meta,
 *   stdin: ansi
 *     .cursorDown
 *     .cursorDown
 *     .text("\n")
 *     .toArray(),
 *   async fn() {
 *     const name = await Select.prompt({
 *       message: "Select a color",
 *       options: ["red", "green", "blue"],
 *     });
 *     assertEquals(name, "blue");
 *   },
 * });
 * ```
 *
 * To update the snapshots run `deno test -A test.ts -- --update`.
 *
 * This will create a snapshot file with following content:
 *
 * ```
 * export const snapshot = {};
 *
 * snapshot[`should select a color 1`] = `
 * stdout:
 * "? Select a color
 * ❯ red
 *   green
 *   blue\\x1b[3A\\x1b[0G\\x1b[?25l\\x1b[G\\x1b[0J
 * ? Select a color
 *   red
 * ❯ green
 *   blue\\x1b[3A\\x1b[0G\\x1b[?25l\\x1b[G\\x1b[0J
 * ? Select a color
 *   red
 *   green
 * ❯ blue\\x1b[3A\\x1b[0G\\x1b[?25l\\x1b[G\\x1b[0J
 * ? Select a color › blue
 * \\x1b[?25h\\x1b[?25h"
 * stderr:
 * ""
 * `;
 * ```
 *
 * @module
 */

export {
  snapshotTest,
  type SnapshotTestOptions,
  type SnapshotTestStep,
} from "./snapshot.ts";

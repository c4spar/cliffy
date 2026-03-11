// deno-lint-ignore-file no-explicit-any
import { eraseDown } from "@cliffy/ansi/ansi-escapes";
import { getRuntimeName } from "@cliffy/internal/runtime/runtime-name";
import { getEnv } from "@cliffy/internal/runtime/get-env";
import { test } from "@cliffy/internal/testing/test";

import { quoteString } from "./_quote_string.ts";
import { red } from "@std/fmt/colors";
import { assertSnapshot } from "@std/testing/snapshot";
import { AssertionError } from "@std/assert/assertion-error";

/** Snapshot test step options. */
export interface SnapshotTestStep {
  /** Data written to the test process. */
  stdin?: Array<string> | string;
  /** Arguments passed to the test file. */
  args?: Array<string>;
  /** If enabled, test error will be ignored. */
  canFail?: true;
  env?: Record<string, string>;
}

/** Snapshot test options. */
export interface SnapshotTestOptions extends SnapshotTestStep {
  /** Test name. */
  name: string;
  /** Import meta. Required to determine the import url of the test file. */
  meta: ImportMeta;
  /** Test function. */
  fn(): void | Promise<void>;
  /**
   * Object of test steps. Key is the test name and the value is an array of
   * input sequences/characters.
   */
  steps?: Record<string, SnapshotTestStep>;
  /**
   * Arguments passed to the `deno test` command when executing the snapshot
   * tests. `--allow-env=SNAPSHOT_TEST_NAME` is passed by default.
   */
  denoArgs?: Array<string>;
  /**
   * Snapshot output directory. Snapshot files will be written to this directory.
   * This can be relative to the test directory or an absolute path.
   *
   * If both `dir` and `path` are specified, the `dir` option will be ignored and
   * the `path` option will be handled as normal.
   */
  dir?: string;
  /**
   * Snapshot output path. The snapshot will be written to this file. This can be
   * a path relative to the test directory or an absolute path.
   *
   * If both `dir` and `path` are specified, the `dir` option will be ignored and
   * the `path` option will be handled as normal.
   */
  path?: string;
  /**
   * Operating system snapshot suffix. This is useful when your test produces
   * different output on different operating systems.
   */
  osSuffix?: Array<typeof Deno.build.os>;
  /** Enable/disable colors. Default is `false`. */
  colors?: boolean;
  /**
   * Timeout in milliseconds to wait until the input stream data is buffered
   * before writing the next data to the stream. This ensures that each user
   * input is rendered as separate line in the snapshot file. If your test gets
   * flaky, try to increase the timeout. The default timeout is `600`.
   */
  timeout?: number;
  /** If truthy the current test step will be ignored.
   *
   * It is a quick way to skip over a step, but also can be used for
   * conditional logic, like determining if an environment feature is present.
   */
  ignore?: boolean;
  /** If at least one test has `only` set to `true`, only run tests that have
   * `only` set to `true` and fail the test suite. */
  only?: boolean;
  /** Function to use when serializing the snapshot. */
  serializer?: (actual: string) => string;
}

const encoder = new TextEncoder();

/**
 * Run prompt snapshot tests.
 *
 * ```ts
 * import { snapshotTest } from "./snapshot.ts";
 * import { Input } from "@cliffy/prompt/input";
 *
 * await snapshotTest({
 *   name: "test name",
 *   meta: import.meta,
 *   osSuffix: ["windows"],
 *   steps: {
 *     "should enter some text": { stdin: ["foo bar", "\n"] },
 *   },
 *   async fn() {
 *     await Input.prompt({
 *       message: "Whats your name?",
 *       default: "foo",
 *     });
 *   },
 * });
 * ```
 *
 * @param options Test options
 */
export async function snapshotTest(
  options: SnapshotTestOptions,
): Promise<void> {
  if (options.meta.main) {
    await runTest(options);
  } else {
    registerTest(options);
  }
}

function registerTest(options: SnapshotTestOptions) {
  const fileName = options.meta.url.split("/").at(-1) ?? "";

  if (["node", "bun"].includes(getRuntimeName())) {
    test({
      name: options.name,
      ignore: true,
      fn() {},
    });
  } else {
    Deno.test({
      name: options.name,
      ignore: options.ignore ?? false,
      only: options.only ?? false,
      async fn(ctx) {
        const steps = Object.entries(options.steps ?? {});
        if (steps.length) {
          for (const [name, step] of steps) {
            await ctx.step({
              name,
              fn: (ctx) => fn(ctx, step),
            });
          }
        } else {
          await fn(ctx);
        }
      },
    });
  }

  async function fn(
    ctx: Deno.TestContext,
    step?: SnapshotTestStep,
  ) {
    const { stdout, stderr } = await executeTest(options, step);

    const serializer = options.serializer ?? quoteString;
    const output = `stdout:\n${serializer(stdout)}\nstderr:\n${
      serializer(stderr)
    }`;

    const suffix = options.osSuffix?.includes(Deno.build.os)
      ? `.${Deno.build.os}`
      : "";

    await assertSnapshot(ctx, output, {
      dir: options.dir,
      path: options.path ??
        (options.dir ? undefined : `__snapshots__/${fileName}${suffix}.snap`),
      serializer: (value) => value,
    });
  }
}

async function executeTest(
  options: SnapshotTestOptions,
  step?: SnapshotTestStep,
): Promise<{ stdout: string; stderr: string }> {
  let output: Deno.CommandOutput | undefined;
  let stdout: string | undefined;
  let stderr: string | undefined;

  try {
    let denoArgs: Array<string>;
    const env = {
      SNAPSHOT_TEST_NAME: options.name,
      ...options.colors ? {} : { NO_COLOR: "true" },
      ...options?.env ?? {},
      ...step?.env ?? {},
    };
    const envNames = Object.keys(env);

    if (options.denoArgs) {
      denoArgs = options.denoArgs;
    } else {
      denoArgs = ["--quiet", `--allow-env=${envNames.join(",")}`];
    }

    const cmd = new Deno.Command("deno", {
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
      args: [
        "run",
        ...denoArgs,
        options.meta.url,
        ...options.args ?? [],
        ...step?.args ?? [],
      ],
      env,
    });
    const child: Deno.ChildProcess = cmd.spawn();
    const writer = child.stdin.getWriter();

    const stdin = [
      ...options?.stdin ?? [],
      ...step?.stdin ?? [],
    ];

    if (stdin.length) {
      const delay = Number(
        await getEnvIfGranted("CLIFFY_SNAPSHOT_DELAY") ||
          (options.timeout ?? Deno.build.os === "windows" ? 1200 : 300),
      );

      for (const data of stdin) {
        await writer.write(encoder.encode(data));
        // Workaround to ensure all inputs are processed and rendered separately.
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    output = await child.output();
    stdout = addLineBreaks(new TextDecoder().decode(output.stdout));
    stderr = addLineBreaks(new TextDecoder().decode(output.stderr));

    writer.releaseLock();
    await child.stdin.close();
  } catch (error: unknown) {
    const assertionError = new AssertionError(
      `Snapshot test failed: ${options.meta.url}.\n${red(stderr ?? "")}`,
    );
    assertionError.cause = error;
    throw assertionError;
  }

  if (!output.success && !options.canFail && !step?.canFail) {
    throw new AssertionError(
      `Snapshot test failed: ${options.meta.url}.` +
        `Test command failed with a none zero exit code: ${output.code}.\n${
          red(stderr ?? "")
        }`,
    );
  }

  return { stdout, stderr };
}

/** Add a line break after each test input. */
function addLineBreaks(str: string) {
  return str.replaceAll(
    eraseDown(),
    eraseDown() + "\n",
  );
}

async function runTest(options: SnapshotTestOptions) {
  const testName = getEnv("SNAPSHOT_TEST_NAME");
  if (testName === options.name) {
    await options.fn();
  }
}

async function getEnvIfGranted(name: string): Promise<string | undefined> {
  let state = "granted";

  // dnt-shim-ignore
  const { Deno } = globalThis as any;
  if (Deno) {
    const status = await Deno.permissions.query({
      name: "env",
      variable: name,
    });
    state = status.state;
  }

  if (state === "granted") {
    return getEnv(name);
  }
}

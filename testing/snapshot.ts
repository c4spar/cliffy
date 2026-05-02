// deno-lint-ignore-file no-explicit-any
import { eraseDown } from "@cliffy/ansi/ansi-escapes";
import { getRuntimeName } from "@cliffy/internal/runtime/runtime-name";
import { getEnv } from "@cliffy/internal/runtime/get-env";
import { test } from "@cliffy/internal/testing/test";
import { red } from "@std/fmt/colors";
import { AssertionError } from "@std/assert/assertion-error";
import { quoteString } from "./_quote_string.ts";

/** Snapshot test step options. */
export interface SnapshotTestStep {
  /** Data written to the test process. */
  stdin?: Array<string> | string;
  /** Arguments passed to the test file. */
  args?: Array<string>;
  /** If enabled, test error will be ignored. */
  canFail?: true;
  env?: Record<string, string>;
  only?: boolean;
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
   * Max time in ms to wait for the subprocess to produce output after each
   * stdin chunk. Only hit when an input produces no output. Default: `1200`
   * on Windows, `300` elsewhere.
   */
  timeout?: number;
  /**
   * Time in ms to wait for output to settle after each stdin chunk before
   * sending the next one. Default: `50` on Windows, `20` elsewhere.
   */
  idleMs?: number;
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
export function snapshotTest(
  options: SnapshotTestOptions,
): Promise<void> | void {
  if (options.meta.main) {
    return runTest(options);
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
    const steps = Object.entries(options.steps ?? {});
    const only = options.only ?? steps.some(([_, step]) => step.only);

    Deno.test({
      name: options.name,
      ignore: options.ignore ?? false,
      only,
      async fn(ctx) {
        if (steps.length) {
          for (const [name, step] of steps) {
            // deno-lint-ignore no-await-in-loop
            await ctx.step({
              name,
              ignore: only ? step.only !== true : false,
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
    const { assertSnapshot } = await import("@std/testing/snapshot");
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
  let status: Deno.CommandStatus | undefined;
  let stdout: string | undefined;
  let stderr: string | undefined;
  let stdoutBuf = "";
  let stderrBuf = "";

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

    const state: State = {
      stdoutBytes: 0,
      stderrBytes: 0,
      lastDataAt: Date.now(),
      dataResolver: Promise.withResolvers(),
      finished: false,
    };

    const onChunk = (text: string, bytes: number) => {
      state.lastDataAt = Date.now();
      const old = state.dataResolver;
      state.dataResolver = Promise.withResolvers();
      old.resolve();
      return { text, bytes };
    };

    const stdoutReader = readStream(child.stdout, (text, bytes) => {
      stdoutBuf += text;
      state.stdoutBytes += bytes;
      onChunk(text, bytes);
    });
    const stderrReader = readStream(child.stderr, (text, bytes) => {
      stderrBuf += text;
      state.stderrBytes += bytes;
      onChunk(text, bytes);
    });

    Promise.all([stdoutReader, stderrReader]).then(() => {
      state.finished = true;
      const old = state.dataResolver;
      state.dataResolver = Promise.withResolvers();
      old.resolve();
    });

    const stdin = [
      ...options?.stdin ?? [],
      ...step?.stdin ?? [],
    ];

    if (stdin.length) {
      const envCeiling = await getEnvIfGranted("CLIFFY_SNAPSHOT_DELAY");
      const timeoutMs = envCeiling
        ? Number(envCeiling)
        : (options.timeout ?? (Deno.build.os === "windows" ? 1200 : 300));

      const envIdle = await getEnvIfGranted("CLIFFY_SNAPSHOT_IDLE_MS");
      const idleMs = envIdle
        ? Number(envIdle)
        : (options.idleMs ?? (Deno.build.os === "windows" ? 50 : 20));

      assertWaitOption("idleMs", idleMs);
      assertWaitOption("timeout", timeoutMs);

      for (const data of stdin) {
        const baseline = {
          stdoutBytes: state.stdoutBytes,
          stderrBytes: state.stderrBytes,
        };
        // deno-lint-ignore no-await-in-loop
        await writer.write(encoder.encode(data));
        // deno-lint-ignore no-await-in-loop
        await waitForRenderAfter(baseline, state, { idleMs, timeoutMs });
      }
    }

    writer.releaseLock();
    await child.stdin.close();

    [status] = await Promise.all([
      child.status,
      stdoutReader,
      stderrReader,
    ]);

    stdout = addLineBreaks(stdoutBuf);
    stderr = addLineBreaks(stderrBuf);
  } catch (error: unknown) {
    const assertionError = new AssertionError(
      `Snapshot test failed: ${options.meta.url}.\n${red(stderr ?? stderrBuf)}`,
    );
    assertionError.cause = error;
    throw assertionError;
  }

  if (!status.success && !options.canFail && !step?.canFail) {
    throw new AssertionError(
      `Snapshot test failed: ${options.meta.url}.` +
        `Test command failed with a none zero exit code: ${status.code}.\n${
          red(stderr ?? "")
        }`,
    );
  }

  return { stdout, stderr };
}

interface State {
  stdoutBytes: number;
  stderrBytes: number;
  lastDataAt: number;
  dataResolver: PromiseWithResolvers<void>;
  finished: boolean;
}

function readStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (text: string, bytes: number) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  return stream.pipeTo(
    new WritableStream({
      write(chunk) {
        onChunk(decoder.decode(chunk, { stream: true }), chunk.byteLength);
      },
      close() {
        const tail = decoder.decode();
        if (tail) {
          onChunk(tail, 0);
        }
      },
    }),
  );
}

/**
 * Wait for the subprocess to produce new output since `baseline` (capped at
 * `timeoutMs`), then wait for `idleMs` of quiet.
 */
async function waitForRenderAfter(
  baseline: { stdoutBytes: number; stderrBytes: number },
  state: State,
  opts: { idleMs: number; timeoutMs: number },
): Promise<void> {
  const ceilingDeadline = Date.now() + opts.timeoutMs;

  // First wait for new output since baseline, with a timeout to avoid waiting
  // indefinitely if the input produces no output.
  while (
    !state.finished &&
    state.stdoutBytes === baseline.stdoutBytes &&
    state.stderrBytes === baseline.stderrBytes
  ) {
    const remaining = ceilingDeadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    // deno-lint-ignore no-await-in-loop
    await raceWithTimeout(state.dataResolver.promise, remaining);
  }

  // Then wait for `idleMs` of quiet.
  while (!state.finished) {
    const sinceLastData = Date.now() - state.lastDataAt;
    if (sinceLastData >= opts.idleMs) {
      break;
    }
    const wait = opts.idleMs - sinceLastData;
    // deno-lint-ignore no-await-in-loop
    await raceWithTimeout(state.dataResolver.promise, wait);
  }
}

function assertWaitOption(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new AssertionError(
      `Invalid \`${name}\`: ${value}. Must be a finite non-negative number.`,
    );
  }
}

/** Race a promise against a timeout, clearing the timer when done. */
async function raceWithTimeout(
  promise: Promise<unknown>,
  ms: number,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  try {
    await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
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

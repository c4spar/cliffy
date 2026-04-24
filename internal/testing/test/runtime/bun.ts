import {
  createTestFunction,
  type GenericTestFunction,
} from "../create_test_function.ts";
import type { TestFn, TestOptions } from "../test_options.ts";

type BunTestMod = { test: BunTest } | { default: { test: BunTest } };
const bunTestMod: BunTestMod = await import("bun:test" + "");

const bunTest: BunTest = "default" in bunTestMod
  ? bunTestMod.default.test
  : bunTestMod.test;

export function createBunTestFunction(): GenericTestFunction<void> {
  return createTestFunction(
    (opts: TestOptions): void => {
      createBunTestInnerFunction(opts);
    },
  );
}

function createBunTestInnerFunction(
  { name, fn, only, ignore }: TestOptions,
): boolean {
  const skip = Array.isArray(ignore) ? ignore.includes("bun") : ignore;
  if (only) {
    bunTest.only(name, createBunTestFn(name, fn));
  } else if (skip) {
    bunTest.skip(name, createBunTestFn(name, fn));
    return true;
  } else {
    bunTest(name, createBunTestFn(name, fn));
  }

  return false;
}

function createBunTestFn(name: string, fn: TestFn): BunTestFn {
  return () => {
    fn({
      name,
      origin: "bun",
      step: createTestFunction((opts: TestOptions): Promise<boolean> =>
        Promise.resolve(createBunTestInnerFunction(opts))
      ),
    });
  };
}

interface BunTest {
  (
    label: string,
    fn: BunTestFn,
    options?: number | BunTestOptions,
  ): void;
  only(
    label: string,
    fn: BunTestFn,
    options?: number | BunTestOptions,
  ): void;
  skip(
    label: string,
    fn: BunTestFn,
    options?: number | BunTestOptions,
  ): void;
}

type BunTestFn =
  | (() => void | Promise<unknown>)
  | ((done: (err?: unknown) => void) => void);

interface BunTestOptions {
  /**
   * Sets the timeout for the test in milliseconds.
   *
   * If the test does not complete within this time, the test will fail with:
   * ```ts
   * 'Timeout: test {name} timed out after 5000ms'
   * ```
   *
   * @default 5000 // 5 seconds
   */
  timeout?: number;
  /**
   * Sets the number of times to retry the test if it fails.
   *
   * @default 0
   */
  retry?: number;
  /**
   * Sets the number of times to repeat the test, regardless of whether it passed or failed.
   *
   * @default 0
   */
  repeats?: number;
}

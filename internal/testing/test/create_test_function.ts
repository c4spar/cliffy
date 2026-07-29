import { yellow } from "@std/fmt/colors";
import type { TestFn, TestOptions } from "./test_options.ts";
import { getRuntimeName } from "../../runtime/runtime_name.ts";
import { withEnv } from "../with_env.ts";

export interface GenericTestFunction<T> {
  (testOptions: TestOptions): T;
  (name: string, fn: TestFn): T;
  (fn: TestFn): T;
}

export function createTestFunction<T>(
  runTest: (options: TestOptions) => T,
): GenericTestFunction<T> {
  return (nameOrOptionsOrFn: string | TestOptions | TestFn, fn?: TestFn): T => {
    if (typeof nameOrOptionsOrFn === "string") {
      return runTest({ name: nameOrOptionsOrFn, fn: fn as TestFn });
    } else if (typeof nameOrOptionsOrFn === "function") {
      return runTest({
        name: nameOrOptionsOrFn.name || "unnamed test",
        fn: nameOrOptionsOrFn,
      });
    }
    const options = nameOrOptionsOrFn;

    if (
      Array.isArray(options.ignore)
        ? options.ignore.includes(getRuntimeName())
        : options.ignore
    ) {
      console.warn(yellow("skip: %s"), options);
    }

    return runTest(
      options.env
        ? { ...options, fn: withEnv(options.env, options.fn) }
        : options,
    );
  };
}

import { yellow } from "@std/fmt/colors";
import type { TestFn, TestOptions } from "./test_options.ts";
import { getRuntimeName } from "../../runtime/runtime_name.ts";

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

    if (
      Array.isArray(nameOrOptionsOrFn.ignore)
        ? nameOrOptionsOrFn.ignore.includes(getRuntimeName())
        : nameOrOptionsOrFn.ignore
    ) {
      console.warn(yellow("skip: %s"), nameOrOptionsOrFn);
    }

    return runTest(nameOrOptionsOrFn);
  };
}

import type { RuntimeName } from "../../runtime/runtime_name.ts";

export interface TestOptions {
  name: string;
  fn: TestFn;
  ignore?: boolean | Array<RuntimeName>;
  only?: boolean;
  /** Environment variables set for the duration of the test. */
  env?: Record<string, string>;
}

export interface TestFn {
  (t: TestContext): void | Promise<void>;
}

export interface TestContext {
  name: string;
  origin: string;
  step(options: TestOptions): Promise<boolean>;
  step(name: string, fn: TestFn): Promise<boolean>;
  step(fn: TestFn): Promise<boolean>;
}

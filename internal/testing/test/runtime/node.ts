// import type { TestContext as NodeTestContext } from "node:test";
import { test as nodeTest } from "node:test";
import {
  createTestFunction,
  type GenericTestFunction,
} from "../create_test_function.ts";
import type { TestFn, TestOptions } from "../test_options.ts";

export function createNodeTestFunction(): GenericTestFunction<void> {
  return createTestFunction(
    ({ name, fn, only, ignore }: TestOptions) =>
      nodeTest(name, {
        only,
        skip: Array.isArray(ignore) ? ignore.includes("node") : ignore,
      }, createNodeTestFn(fn)),
  );
}

function createNodeTestFn(fn: TestFn): NodeTestFn {
  return (ctx: NodeTestContext) =>
    fn({
      name: ctx.test.name,
      origin: "node",
      step: createTestFunction(async ({ name, ignore, fn: stepFn }) => {
        const skip = Array.isArray(ignore)
          ? ignore.includes("node")
          : ignore === true;

        await ctx.test(name, { skip }, createNodeTestFn(stepFn));

        return skip;
      }),
    });
}

// deno-lint-ignore no-explicit-any
type NodeTestFn = (t: NodeTestContext, done: (result?: any) => void) => any;

interface NodeTestContext {
  test: typeof nodeTest;
}

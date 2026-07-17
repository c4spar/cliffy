// deno-lint-ignore-file no-explicit-any

import type { RuntimeName } from "@cliffy/internal/runtime/runtime-name";
import type { Runtime } from "./runtime.ts";

/** Result of getRuntime(). */
export interface GetRuntimeResult {
  runtimeName: RuntimeName;
  runtime: Runtime;
}

/** Get runtime handler for current runtime. */
export async function getRuntime(): Promise<GetRuntimeResult> {
  // dnt-shim-ignore
  const { Deno, process } = globalThis as any;

  if (Deno?.version?.deno) {
    const { DenoRuntime } = await import("./runtime/deno_runtime.ts");
    return { runtimeName: "deno", runtime: new DenoRuntime() };
  } else if (process?.versions?.bun) {
    const { BunRuntime } = await import("./runtime/bun_runtime.ts");
    return { runtimeName: "bun", runtime: new BunRuntime() };
  } else if (process?.versions?.node) {
    const { NodeRuntime } = await import("./runtime/node_runtime.ts");
    return { runtimeName: "node", runtime: new NodeRuntime() };
  } else {
    throw new Error("Unsupported runtime.");
  }
}

import { getRuntimeName, type RuntimeName } from "../runtime/runtime_name.ts";

interface Output {
  isTerminal?: () => boolean;
  isTTY?: boolean;
}

const runtimeGlobals = globalThis as unknown as {
  Deno: { stdout: Output };
  process: { stdout: Output };
};

const terminalProperties: Record<RuntimeName, keyof Output> = {
  deno: "isTerminal",
  node: "isTTY",
  bun: "isTTY",
};

/**
 * Overrides the runtime's terminal check for the standard output.
 *
 * @param isTerminal Whether the standard output should be treated as a TTY.
 * @returns A function that restores the original terminal check.
 *
 * @internal
 */
export function fakeOutputTerminal(isTerminal: boolean): () => void {
  const runtime = getRuntimeName();
  const output = runtime === "deno"
    ? runtimeGlobals.Deno.stdout
    : runtimeGlobals.process.stdout;
  const property = terminalProperties[runtime];
  const descriptor = Object.getOwnPropertyDescriptor(output, property);

  Object.defineProperty(output, property, {
    configurable: true,
    value: runtime === "deno" ? () => isTerminal : isTerminal,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(output, property, descriptor);
    } else {
      delete output[property];
    }
  };
}

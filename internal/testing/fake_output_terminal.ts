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
 * Options for the faked standard output.
 *
 * @internal
 */
export interface FakeOutputTerminalOptions {
  /** Whether the standard output should be treated as a TTY. */
  isTerminal: boolean;
}

/**
 * Overrides the runtime's terminal check for the standard output.
 *
 * @param options Options for the faked standard output.
 * @returns A function that restores the original terminal check.
 *
 * @internal
 */
export function fakeOutputTerminal(
  { isTerminal }: FakeOutputTerminalOptions,
): () => void {
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

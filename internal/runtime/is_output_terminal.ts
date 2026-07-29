// deno-lint-ignore-file no-explicit-any

/**
 * Checks if the standard output is a TTY.
 *
 * @internal
 */
export function isOutputTerminal(): boolean {
  // dnt-shim-ignore
  const { Deno, process } = globalThis as any;

  if (Deno) {
    return Deno.stdout.isTerminal();
  } else if (process) {
    return process.stdout.isTTY === true;
  }

  throw new Error("unsupported runtime");
}

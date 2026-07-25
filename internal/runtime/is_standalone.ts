// deno-lint-ignore-file no-explicit-any

/**
 * Detect whether the current process is a compiled standalone executable
 * (`deno compile`, `bun build --compile`, or a Node single executable
 * application).
 *
 * @internal
 */
export function isStandalone(): boolean {
  // dnt-shim-ignore
  const { Deno, process, Bun } = globalThis as any;

  if (Deno) {
    return Deno.build?.standalone === true;
  } else if (Bun) {
    return Bun.isStandaloneExecutable === true;
  } else if (process) {
    return process.getBuiltinModule?.("node:sea")?.isSea?.() === true;
  }

  throw new Error("unsupported runtime");
}

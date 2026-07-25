// deno-lint-ignore-file no-explicit-any

/**
 * Get the path of the currently running executable.
 *
 * For a script install this is the runtime binary (e.g. `deno`). For a
 * compiled standalone binary it is the binary itself.
 *
 * @internal
 */
export function getExecPath(): string {
  // dnt-shim-ignore
  const { Deno, process } = globalThis as any;

  if (Deno) {
    return Deno.execPath();
  } else if (process) {
    return process.execPath;
  }

  throw new Error("unsupported runtime");
}

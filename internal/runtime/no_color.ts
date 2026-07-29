// deno-lint-ignore-file no-explicit-any

/**
 * Checks if colors are disabled.
 *
 * @internal
 */
export function getNoColor(): boolean {
  // dnt-shim-ignore
  const { Deno, process } = globalThis as any;

  if (Deno) {
    return Deno.noColor;
  } else if (process) {
    return Boolean(process?.env.NO_COLOR) ||
      Boolean(process?.env.NODE_DISABLE_COLORS);
  }

  throw new Error("unsupported runtime");
}

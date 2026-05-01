// deno-lint-ignore-file no-explicit-any

/**
 * Returns the width of the console window.
 *
 * @internal
 */
export function getColumns(): number | null {
  try {
    // dnt-shim-ignore
    const { Deno, process } = globalThis as any;

    // Catch error in none tty mode: Inappropriate ioctl for device (os error 25)
    if (Deno) {
      const cols = Deno.consoleSize().columns;
      return cols && cols > 0 ? cols : null;
    } else if (process) {
      const cols = process.stdout.columns;
      return cols && cols > 0 ? cols : null;
    }
  } catch (_error) {
    return null;
  }

  throw new Error("unsupported runtime");
}

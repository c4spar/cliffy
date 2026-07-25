// deno-lint-ignore-file no-explicit-any

/**
 * Rename (move) a file or directory.
 *
 * @internal
 * @param oldPath Source path.
 * @param newPath Destination path.
 */
export async function rename(oldPath: string, newPath: string): Promise<void> {
  // dnt-shim-ignore
  const { Deno } = globalThis as any;

  if (Deno) {
    await Deno.rename(oldPath, newPath);
    return;
  }

  const { rename } = await import("node:fs/promises");
  await rename(oldPath, newPath);
}

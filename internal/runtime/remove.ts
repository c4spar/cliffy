// deno-lint-ignore-file no-explicit-any

/**
 * Remove a file.
 *
 * @internal
 * @param path Path to the file.
 */
export async function remove(path: string): Promise<void> {
  // dnt-shim-ignore
  const { Deno } = globalThis as any;

  if (Deno) {
    await Deno.remove(path);
    return;
  }

  const { rm } = await import("node:fs/promises");
  await rm(path);
}

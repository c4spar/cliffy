// deno-lint-ignore-file no-explicit-any

/**
 * Create a directory, including any missing parents. No-op if it already
 * exists.
 *
 * @internal
 * @param path Path to the directory.
 */
export async function mkdir(path: string): Promise<void> {
  // dnt-shim-ignore
  const { Deno } = globalThis as any;

  if (Deno) {
    await Deno.mkdir(path, { recursive: true });
    return;
  }

  const { mkdir } = await import("node:fs/promises");
  await mkdir(path, { recursive: true });
}

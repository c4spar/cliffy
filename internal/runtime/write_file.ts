// deno-lint-ignore-file no-explicit-any

/**
 * Write bytes to a file.
 *
 * @internal
 * @param path Path to the file.
 * @param data Bytes to write.
 */
export async function writeFile(path: string, data: Uint8Array): Promise<void> {
  // dnt-shim-ignore
  const { Deno } = globalThis as any;

  if (Deno) {
    await Deno.writeFile(path, data);
    return;
  }

  const { writeFile } = await import("node:fs/promises");
  await writeFile(path, data);
}

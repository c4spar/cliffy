// deno-lint-ignore-file no-explicit-any

import { getOs } from "./get_os.ts";

/**
 * Change the permission mode of a file. No-op on Windows, which has no unix
 * permission bits.
 *
 * @internal
 * @param path Path to the file.
 * @param mode Permission mode, e.g. `0o755`.
 */
export async function chmod(path: string, mode: number): Promise<void> {
  if (getOs() === "windows") {
    return;
  }

  // dnt-shim-ignore
  const { Deno } = globalThis as any;

  if (Deno) {
    await Deno.chmod(path, mode);
    return;
  }

  const { chmod } = await import("node:fs/promises");
  await chmod(path, mode);
}

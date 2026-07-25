// deno-lint-ignore-file no-explicit-any

/** Permission descriptor subset used across the codebase. */
export type PermissionDescriptor =
  | { name: "net"; host?: string }
  | { name: "read" | "write"; path?: string };

/**
 * Whether the given permission is granted or not.
 *
 * @internal
 * @param descriptor Permission to check, e.g. `{ name: "net", host }`.
 */
export async function hasPermission(
  descriptor: PermissionDescriptor,
): Promise<boolean> {
  // dnt-shim-ignore
  const { Deno } = globalThis as any;

  if (Deno?.permissions?.query) {
    const status = await Deno.permissions.query(descriptor);
    return status.state === "granted";
  }

  return true;
}

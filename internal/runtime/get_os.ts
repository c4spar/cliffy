// deno-lint-ignore-file no-explicit-any

/**
 * Get operating system name, normalized to the Deno convention.
 *
 * @internal
 */
export function getOs():
  | "darwin"
  | "linux"
  | "android"
  | "windows"
  | "freebsd"
  | "netbsd"
  | "aix"
  | "solaris"
  | "illumos"
  | "openbsd"
  | "sunos" {
  // dnt-shim-ignore
  const { Deno, process } = globalThis as any;

  if (Deno) {
    return Deno.build.os;
  } else if (process) {
    return process.platform === "win32" ? "windows" : process.platform;
  } else {
    throw new Error("unsupported runtime");
  }
}

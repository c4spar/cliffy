// deno-lint-ignore-file no-explicit-any

/**
 * Get the cpu architecture, normalized to the Deno convention
 * (`x86_64`/`aarch64`). Node's/Bun's `x64`/`arm64` are mapped so the value is
 * stable across runtimes.
 *
 * @internal
 */
export function getArch(): string {
  // dnt-shim-ignore
  const { Deno, process } = globalThis as any;

  if (Deno) {
    return Deno.build.arch;
  } else if (process) {
    switch (process.arch) {
      case "x64":
        return "x86_64";
      case "arm64":
        return "aarch64";
      default:
        return process.arch;
    }
  }

  throw new Error("unsupported runtime");
}

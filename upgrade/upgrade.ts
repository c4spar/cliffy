import { bold, brightBlue, dim, red } from "@std/fmt/colors";
import { getRuntime } from "./get_runtime.ts";
import type { RuntimeUpgradeOptions } from "./runtime.ts";
import type { DenoRuntimeOptions } from "./runtime/deno_runtime.ts";

/** Shared runtime options. */
export interface RuntimeOptions {
  /** Additional arguments passed to the runtime's install command. */
  args?: Array<string>;
  /** Main entrypoint module of the package, appended to the registry url. */
  main?: string;
}

/** Runtime options map for supported runtimes. */
export interface RuntimeOptionsMap {
  /** Options applied when upgrading on the Deno runtime. */
  deno?: RuntimeOptions & DenoRuntimeOptions;
  /** Options applied when upgrading on the Node runtime. */
  node?: RuntimeOptions;
  /** Options applied when upgrading on the Bun runtime. */
  bun?: RuntimeOptions;
}

/**
 * Options for upgrading a package from a provided registry with any supported
 * runtimes.
 * Currently supported runtimes are: `deno`, `node` and `bun`.
 */
export interface UpgradeOptions extends RuntimeUpgradeOptions {
  /** Per-runtime overrides applied when the matching runtime is detected. */
  runtime?: RuntimeOptionsMap;
}

/**
 * Upgrade a package from given registry.
 * Runtime is auto-detected. Currently supported runtimes are: `deno`, `node` and `bun`.
 */
export async function upgrade(
  {
    runtime: runtimeOptions,
    provider,
    ...options
  }: UpgradeOptions,
): Promise<void> {
  if (options.logger) {
    provider.setLogger(options.logger);
  }

  if (
    options.force ||
    !options.from ||
    await provider.isOutdated(options.name, options.from, options.to)
  ) {
    if (options.to === "latest") {
      options.logger?.log(
        dim("Upgrading %s to the %s version"),
        options.name,
        options.to,
      );
    } else {
      options.logger?.log(
        dim("Upgrading %s to version %s"),
        options.name,
        options.to,
      );
    }
    options.to = await provider.resolveVersion(options.name, options.to);
    options.logger?.log(dim("Upgrading %s:"), options.name);
    options.logger?.log(dim("  - current version: %s"), options.from);
    options.logger?.log(dim("  - target version: %s"), options.to);

    try {
      if (provider.upgrade) {
        await provider.upgrade(options);
      } else {
        const { runtimeName, runtime } = await getRuntime();
        options.logger?.log(dim("  - runtime: %s"), runtimeName);

        await runtime.upgrade({
          ...options,
          ...(runtimeOptions?.[runtimeName] ?? {}),
          provider,
        });
      }
    } catch (error: unknown) {
      options.logger?.error(
        red(
          `Failed to upgrade ${bold(options.name)} ${
            options.from ? `from version ${bold(options.from)} ` : ""
          }to ${bold(options.to)}.`,
        ),
      );
      throw error;
    }

    options.logger?.info(
      brightBlue(
        `Successfully upgraded ${bold(options.name)} from version ${
          bold(options.from ?? "")
        } to ${bold(options.to)}!`,
      ),
      dim(`(${provider.getRepositoryUrl(options.name, options.to)})`),
    );
  }
}

import { bold, brightBlue, dim, red } from "@std/fmt/colors";
import { getArch } from "@cliffy/internal/runtime/get-arch";
import { getOs } from "@cliffy/internal/runtime/get-os";
import { isStandalone } from "@cliffy/internal/runtime/is-standalone";
import { getRuntime } from "./get_runtime.ts";
import { UnsupportedUpgradeError } from "./unsupported-upgrade-error.ts";
import { installBinary } from "./install_binary.ts";
import type { Provider } from "./provider.ts";
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
  /**
   * Force the install kind instead of auto-detecting it. Set to `true` when
   * the cli is a compiled standalone binary.
   */
  standalone?: boolean;
  /**
   * Target install path for a binary upgrade. Defaults to the running
   * executable (self-replace).
   */
  location?: string;
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
      const standalone = options.standalone ?? isStandalone();

      if (standalone) {
        await upgradeBinary(provider, options);
      } else if (!provider.supportsScriptUpgrade) {
        throw new UnsupportedUpgradeError(
          `Upgrading via a script is not supported by the "${provider.name}" registry.`,
        );
      } else if (provider.upgrade) {
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

async function upgradeBinary(
  provider: Provider,
  options: Omit<UpgradeOptions, "provider">,
): Promise<void> {
  if (!provider.supportsBinaryUpgrade || !provider.getBinaryAsset) {
    throw new UnsupportedUpgradeError(
      `Upgrading a standalone executable is not supported by the "${provider.name}" registry.`,
    );
  }

  const os = getOs();
  const arch = getArch();
  options.logger?.log(dim("  - target: %s-%s"), os, arch);

  const asset = await provider.getBinaryAsset({
    name: options.name,
    version: options.to,
    os,
    arch,
  });
  options.logger?.log(dim("  - asset: %s"), asset.name);

  await installBinary(asset, {
    name: options.name,
    location: options.location ?? provider.location,
    logger: options.logger,
  });
}

import { AssetNotFoundError } from "./asset-not-found-error.ts";
import type { BinaryUpgradeContext } from "./provider.ts";

/**
 * Resolves the release asset filename for a build target, either as an
 * `os-arch` -> filename map or a function.
 */
export type AssetResolver =
  | Record<`${string}-${string}`, string>
  | ((context: BinaryUpgradeContext) => string);

/** Resolves the binary to extract from an archive asset. */
export type BinaryNameResolver =
  | string
  | ((context: BinaryUpgradeContext) => string);

/** Resolve the asset filename for the build target from an asset config. */
export function resolveAssetName(
  asset: AssetResolver | undefined,
  context: BinaryUpgradeContext,
): string {
  if (!asset) {
    throw new AssetNotFoundError(
      "No release asset configured. Set the `asset` option to enable binary upgrades.",
    );
  }
  if (typeof asset === "function") {
    return asset(context);
  }
  const key = `${context.os}-${context.arch}` as const;
  const assetName = asset[key];
  if (!assetName) {
    throw new AssetNotFoundError(
      `No release asset configured for target "${key}". Configured targets: ${
        Object.keys(asset).join(", ")
      }`,
    );
  }
  return assetName;
}

/** Resolve the archive entry name, defaulting to the cli name. */
export function resolveBinaryName(
  binaryName: BinaryNameResolver | undefined,
  context: BinaryUpgradeContext,
): string {
  const resolved = typeof binaryName === "function"
    ? binaryName(context)
    : binaryName;
  return resolved ?? context.name;
}

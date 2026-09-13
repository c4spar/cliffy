import { usageError } from "@cliffy/internal/errors/usage-error";
import { UpgradeError } from "./upgrade-error.ts";

/**
 * Thrown when no release asset matches the current os/arch, or when the
 * requested binary can't be located inside a downloaded archive.
 */
export class AssetNotFoundError extends UpgradeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, AssetNotFoundError.prototype);
  }
}

Object.defineProperty(AssetNotFoundError.prototype, usageError, {
  value: true,
});

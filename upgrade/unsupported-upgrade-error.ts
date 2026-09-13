import { usageError } from "@cliffy/internal/errors/usage-error";
import { UpgradeError } from "./upgrade-error.ts";

/**
 * Thrown when the selected provider can't perform the requested upgrade,
 * e.g. a binary upgrade for a standalone cli or a script reinstall.
 */
export class UnsupportedUpgradeError extends UpgradeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, UnsupportedUpgradeError.prototype);
  }
}

Object.defineProperty(UnsupportedUpgradeError.prototype, usageError, {
  value: true,
});

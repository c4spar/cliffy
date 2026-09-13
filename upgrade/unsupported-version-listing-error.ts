import { usageError } from "@cliffy/internal/errors/usage-error";
import { UpgradeError } from "./upgrade-error.ts";

/** Thrown when the selected provider can't list available versions. */
export class UnsupportedVersionListingError extends UpgradeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, UnsupportedVersionListingError.prototype);
  }
}

Object.defineProperty(UnsupportedVersionListingError.prototype, usageError, {
  value: true,
});

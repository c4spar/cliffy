import { usageError } from "@cliffy/internal/errors/usage-error";
import { UpgradeError } from "./upgrade-error.ts";

/** Thrown when the requested version does not exist in the registry. */
export class VersionNotFoundError extends UpgradeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, VersionNotFoundError.prototype);
  }
}

Object.defineProperty(VersionNotFoundError.prototype, usageError, {
  value: true,
});

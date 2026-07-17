import { UpgradeError } from "./upgrade-error.ts";

/** Thrown when the requested version does not exist in the registry. */
export class VersionNotFoundError extends UpgradeError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, VersionNotFoundError.prototype);
  }
}

import { UpgradeError } from "./upgrade-error.ts";

/** Thrown when the selected provider can't list available versions. */
export class UnsupportedVersionListingError extends UpgradeError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnsupportedVersionListingError.prototype);
  }
}

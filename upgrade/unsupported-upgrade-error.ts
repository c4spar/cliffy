import { UpgradeError } from "./upgrade-error.ts";

/**
 * Thrown when the cli runs as a standalone binary but the selected provider
 * can't perform a binary upgrade.
 */
export class UnsupportedUpgradeError extends UpgradeError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnsupportedUpgradeError.prototype);
  }
}

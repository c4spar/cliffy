/** Base class for all errors thrown by the upgrade api. */
export abstract class UpgradeError extends Error {
  protected constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, UpgradeError.prototype);
  }
}

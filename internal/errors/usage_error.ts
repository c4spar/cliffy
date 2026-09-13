/**
 * Marks an error as caused by user input.
 *
 * @internal
 */
export const usageError: unique symbol = Symbol.for("cliffy.usageError");

/**
 * An error marked with {@linkcode usageError}.
 *
 * @internal
 */
export interface UsageError extends Error {
  readonly [usageError]: true;
}

/**
 * Check whether an error is marked as caused by user input.
 *
 * @internal
 * @param error The value to check.
 */
export function isUsageError(error: unknown): error is UsageError {
  return error instanceof Error &&
    (error as Partial<UsageError>)[usageError] === true;
}

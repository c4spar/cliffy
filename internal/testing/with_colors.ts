import { getColorEnabled, setColorEnabled } from "@std/fmt/colors";

/**
 * Wraps a test function with a color state.
 *
 * Enables or disables colors before invoking the test function and restores the
 * previous state afterwards.
 *
 * @param enabled Whether colors are enabled for the test function.
 * @param fn Test function to wrap.
 * @returns The wrapped test function.
 *
 * @internal
 */
export function withColors<TArgs extends Array<unknown>>(
  enabled: boolean,
  fn: (...args: TArgs) => Promise<void> | void,
): (...args: TArgs) => Promise<void> {
  return async (...args: TArgs) => {
    const colorsEnabled = getColorEnabled();
    setColorEnabled(enabled);

    try {
      await fn(...args);
    } finally {
      setColorEnabled(colorsEnabled);
    }
  };
}

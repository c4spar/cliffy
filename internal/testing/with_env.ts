import { deleteEnv } from "../runtime/delete_env.ts";
import { getEnv } from "../runtime/get_env.ts";
import { setEnv } from "../runtime/set_env.ts";

/**
 * Wraps a test function with environment variables.
 *
 * Sets the given environment variables before invoking the test function and
 * restores their previous values afterwards. Variables that were not set
 * before are deleted again.
 *
 * @param vars Environment variables to set for the test function.
 * @param fn Test function to wrap.
 * @returns The wrapped test function.
 *
 * @internal
 */
export function withEnv(
  vars: Record<string, string>,
  fn: () => Promise<void> | void,
): () => Promise<void> {
  return async () => {
    const names = Object.keys(vars);
    const previousValues: Record<string, string | undefined> = Object
      .fromEntries(names.map((name) => [name, getEnv(name)]));

    for (const name of names) {
      setEnv(name, vars[name]);
    }

    try {
      await fn();
    } finally {
      for (const name of names) {
        const previousValue = previousValues[name];

        if (previousValue === undefined) {
          deleteEnv(name);
        } else {
          setEnv(name, previousValue);
        }
      }
    }
  };
}

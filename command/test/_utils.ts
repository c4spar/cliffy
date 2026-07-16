import { deleteEnv } from "@cliffy/internal/runtime/delete-env";
import { setEnv } from "@cliffy/internal/runtime/set-env";

export function withEnv(
  vars: Record<string, string>,
  fn: () => Promise<void> | void,
): () => Promise<void> {
  return async () => {
    for (const [name, value] of Object.entries(vars)) {
      setEnv(name, value);
    }
    try {
      await fn();
    } finally {
      for (const name of Object.keys(vars)) {
        deleteEnv(name);
      }
    }
  };
}

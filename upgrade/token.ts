import { getEnv } from "@cliffy/internal/runtime/get-env";

/** Resolves a token, falling back to environment variables. */
export type TokenResolver = () =>
  | string
  | undefined
  | Promise<string | undefined>;

/**
 * Resolve a token from an explicit value or resolver and falling back to a
 * given environment variables.
 */
export async function resolveToken(
  token: string | TokenResolver | undefined,
  envVars: Array<string>,
): Promise<string | undefined> {
  const tokenValue = typeof token === "function" ? await token() : token;
  if (tokenValue) {
    return tokenValue;
  }
  for (const name of envVars) {
    const value = safeGetEnv(name);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function safeGetEnv(name: string): string | undefined {
  try {
    return getEnv(name);
  } catch {
    // Env access may be denied (e.g. missing --allow-env); skip silently.
    return undefined;
  }
}

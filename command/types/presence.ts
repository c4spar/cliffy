import { Type } from "../type.ts";

/**
 * Presence based type for environment variables.
 *
 * The value is not parsed, any non-empty value resolves to `true`. An unset or
 * empty variable is treated as not set and adds no value at all. This is the
 * convention used by variables such as [`NO_COLOR`](https://no-color.org).
 *
 * @example Declare a presence based environment variable
 * ```ts
 * import { Command } from "@cliffy/command";
 *
 * await new Command()
 *   .env("NO_CACHE=<value:presence>", "Disable the cache.", {
 *     negatable: true,
 *   })
 *   .parse();
 * ```
 */
export class PresenceType extends Type<boolean> {
  /** Resolve any non-empty value to `true`. */
  public parse(): boolean {
    return true;
  }

  /** Complete presence type. */
  public override complete(): string[] {
    return ["1"];
  }
}

/**
 * A commandline arguments parser for [Deno](https://deno.com),
 * [Node](https://nodejs.org) and [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/flags).
 *
 * ## Examples
 *
 * Some example CLIs.
 *
 * ### Basic usage
 *
 * Parse all arguments with automatic type detection.
 *
 * ```ts
 * import { parseFlags } from "@cliffy/flags";
 *
 * console.log(parseFlags());
 * ```
 *
 * ### Volume converter
 *
 * A CLI to convert volume from liters to gallons or vice versa.
 *
 * ```ts
 * import { parseFlags } from "@cliffy/flags";
 *
 * const { flags: { unit }, unknown: [volume] } = parseFlags(Deno.args, {
 *   flags: [{
 *     name: "unit",
 *     aliases: ["u"],
 *     type: "string",
 *     default: "l",
 *   }],
 * });
 *
 * if (unit === "l") {
 *   const gallons = Number(volume) * 0.264172;
 *   console.log(`${volume} L is ${gallons.toFixed(2)} gal.`);
 * } else {
 *   const liters = Number(volume) / 0.264172;
 *   console.log(`${volume} gal is ${liters.toFixed(2)} L.`);
 * }
 * ```
 *
 * @module
 */
export { parseFlags } from "./flags.ts";
export {
  type ArgumentOptions,
  type ArgumentType,
  type ArgumentValue,
  type ArgumentValueHandler,
  type DefaultValue,
  type DefaultValueHandler,
  type FlagOptions,
  type ParseFlagsContext,
  type ParseFlagsOptions,
  type TypeHandler,
  type ValueHandler,
} from "./types.ts";
export { boolean } from "./types/boolean.ts";
export { integer } from "./types/integer.ts";
export { number } from "./types/number.ts";
export { string } from "./types/string.ts";
export {
  InvalidTypeError,
  UnexpectedArgumentAfterVariadicArgumentError,
  UnexpectedRequiredArgumentError,
  UnknownTypeError,
  ValidationError,
} from "./_errors.ts";

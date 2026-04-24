/**
 * An ansi keycode parser for [Deno](https://deno.com), [Node](https://nodejs.org)
 * and [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/keycode).
 *
 * ## Usage
 *
 * ```ts
 * import { parse } from "https://deno.land/x/cliffy/keycode/mod.ts";
 *
 * console.log(
 *   parse(
 *     "\x1b[A\x1b[B\x1b[C\x1b[D\x1b[E\x1b[F\x1b[H",
 *   ),
 * );
 * ```
 *
 * ```ts
 * [
 *   {
 *     name: "up",
 *     sequence: "\x1b[A",
 *     code: "[A",
 *     ctrl: false,
 *     meta: false,
 *     shift: false,
 *   },
 *   // ...
 * ];
 * ```
 *
 * @module
 */
export { type KeyCode, parse } from "./key_code.ts";

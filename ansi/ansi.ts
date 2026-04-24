/**
 * Chainable ansi escape sequences for [Deno](https://deno.com),
 * [Node](https://nodejs.org) and [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/ansi).
 *
 * ## Usage
 *
 * ### Ansi
 *
 * The ansi module exports an `ansi` object with chainable methods and properties
 * for generating ansi escape sequences. The last property must be invoked as a
 * method to generate the ansi string. If the last method takes some arguments, you
 * have to invoke additionally the `.toString()` method to generate the ansi
 * string.
 *
 * ```ts
 * import { ansi } from "@cliffy/ansi";
 *
 * console.log(
 *   ansi.cursorUp.cursorLeft.eraseDown(),
 * );
 * ```
 *
 * ### Tty
 *
 * The tty module exports a `tty` object which works almost the same way as the
 * `ansi` module. The only difference is, the `tty` module writes the ansi escape
 * sequences directly to `stdout`.
 *
 * ```ts
 * import { tty } from "@cliffy/ansi/tty";
 *
 * tty.cursorSave
 *   .cursorHide
 *   .cursorTo(0, 0)
 *   .eraseScreen();
 * ```
 *
 * ### Colors
 *
 * The colors module is a simple and tiny chainable wrapper around the
 * [jsr:@std/fmt/colors](https://jsr.io/@std/fmt/doc/colors/~) module and works
 * similar to node's [chalk](https://github.com/chalk/chalk) module.
 *
 * ```ts
 * import { colors } from "@cliffy/ansi/colors";
 *
 * console.log(
 *   colors.bold.underline.rgb24("Welcome to Deno.Land!", 0xff3333),
 * );
 * ```
 *
 * @module
 */

import * as ansiEscapes from "./ansi_escapes.ts";
import type { Chain } from "./chain.ts";

type Args = Array<unknown>;
type Executor = (this: AnsiChain, ...args: Args) => string;
type Property = string | Executor;
type PropertyNames = keyof Chain<AnsiChain>;

/** Ansi instance returned by all ansi escape properties. */
export interface AnsiChain extends Chain<AnsiChain> {
  /** Get ansi escape sequence. */
  (): string;

  /** Get ansi escape sequences as string. */
  toString(): string;

  /** Get ansi escape sequences as bytes. */
  bytes(): Uint8Array;
}

/** Create new `Ansi` instance. */
export type AnsiFactory = () => Ansi;

/**
 * Chainable ansi escape sequences.
 *
 * If invoked as method, a new Ansi instance will be returned.
 */
export type Ansi = AnsiFactory & AnsiChain;

/**
 * Chainable ansi escape sequences.
 *
 * The ansi module exports an `ansi` object with chainable methods and properties
 * for generating ansi escape sequence strings. The last property must be invoked
 * as a method to generate the ansi string.
 *
 * ```typescript
 * import { ansi } from "https://deno.land/x/cliffy/ansi/ansi.ts";
 *
 * console.log(
 *   ansi.cursorUp.cursorLeft.eraseDown(),
 * );
 * ```
 *
 * ## Arguments
 *
 * If the last method takes some arguments, you have to invoke the `.toString()`
 * method to generate the ansi string.
 *
 * @example Convert to `string`
 *
 * ```typescript
 * import { ansi } from "https://deno.land/x/cliffy/ansi/ansi.ts";
 *
 * console.log(
 *   ansi.cursorUp(2).cursorLeft.eraseDown(2).toString(),
 * );
 * ```
 *
 * ## Uint8Array
 *
 * To convert the escape sequences to an `Uint8Array` the `.bytes()` method can
 * be used.
 *
 * @example Convert to `Uint8Array`
 *
 * ```typescript
 * import { ansi } from "https://deno.land/x/cliffy/ansi/ansi.ts";
 *
 * await Deno.stdout.write(
 *   ansi.cursorUp.cursorLeft.eraseDown.bytes(),
 * );
 * ```
 *
 * ## Functional
 *
 * You can also directly import the ansi escape methods from the `ansi_escapes.ts`
 * module.
 *
 * @example Standalone functions
 *
 * ```typescript
 * import {
 *   cursorTo,
 *   eraseDown,
 *   image,
 *   link,
 * } from "https://deno.land/x/cliffy/ansi/ansi_escapes.ts";
 *
 * const response = await fetch("https://deno.land/images/hashrock_simple.png");
 * const imageBuffer: ArrayBuffer = await response.arrayBuffer();
 *
 * console.log(
 *   cursorTo(0, 0) +
 *     eraseDown() +
 *     image(imageBuffer, {
 *       width: 29,
 *       preserveAspectRatio: true,
 *     }) +
 *     "\n          " +
 *     link("Deno Land", "https://deno.land") +
 *     "\n",
 * );
 * ```
 */
export const ansi: Ansi = factory();

const encoder = new TextEncoder();

function factory(): Ansi {
  let result: Array<string> = [];
  let stack: Array<[Property, Args]> = [];

  const ansi: Ansi = function (
    this: AnsiChain | undefined,
    ...args: Args
  ): string | AnsiChain {
    if (this) {
      if (args.length) {
        update(args);
        return this;
      }
      return this.toString();
    }
    return factory();
  } as Ansi;

  ansi.text = function (text: string): AnsiChain {
    stack.push([text, []]);
    return this;
  };

  ansi.toArray = function (): Array<string> {
    update();
    const ret: Array<string> = result;
    result = [];
    return ret;
  };

  ansi.toString = function (): string {
    return this.toArray().join("");
  };

  ansi.bytes = function (): Uint8Array {
    return encoder.encode(this.toString());
  };

  const methodList: Array<[PropertyNames, Property]> = Object.entries(
    ansiEscapes,
  ) as Array<[PropertyNames, Property]>;

  for (const [name, method] of methodList) {
    Object.defineProperty(ansi, name, {
      get(this: AnsiChain) {
        stack.push([method, []]);
        return this;
      },
    });
  }

  return ansi;

  function update(args?: Args) {
    if (!stack.length) {
      return;
    }
    if (args) {
      stack[stack.length - 1][1] = args;
    }
    result.push(
      ...stack.map(([prop, args]: [Property, Args]) =>
        typeof prop === "string" ? prop : prop.call(ansi, ...args)
      ),
    );
    stack = [];
  }
}

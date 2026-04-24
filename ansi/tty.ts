import { readSync } from "@cliffy/internal/runtime/read-sync";
import { setRaw } from "@cliffy/internal/runtime/set-raw";
import { writeSync } from "@cliffy/internal/runtime/write-sync";
import * as ansiEscapes from "./ansi_escapes.ts";
import type { Chain } from "./chain.ts";
import { type Cursor, getCursorPosition } from "./cursor_position.ts";
import type { ReaderSync, WriterSync } from "@std/io/types";

/** Create new `Ansi` instance. */
export interface TtyOptions {
  writer?: WriterSync;
  reader?: ReaderSync & {
    setRaw(mode: boolean, options?: Deno.SetRawOptions): void;
  };
}

type Executor = (this: TtyChain, ...args: Args) => string;
type Args = Array<unknown>;
type Property = string | Executor;
type PropertyNames = keyof Chain<TtyChain>;

/** Ansi instance returned by all ansi escape properties. */
export interface TtyChain extends Exclude<Chain<TtyChain>, "cursorPosition"> {
  /** Write ansi escape sequence. */
  (): void;
  /** Get current cursor position. */
  getCursorPosition(): Cursor;
}

/** Create new `Tty` instance. */
export type TtyFactory = (options?: TtyOptions) => Tty;

/**
 * Chainable ansi escape sequences.
 * If invoked as method, a new Tty instance will be returned.
 */
export type Tty = TtyFactory & TtyChain;

/**
 * Chainable ansi escape sequences.
 *
 * The tty module exports a `tty` object which works almost the same way as the
 * `ansi` module. The only difference is, the `tty` module writes the ansi escape
 * sequences directly to stdout.
 *
 * @example Default instance
 *
 * ```typescript
 * import { tty } from "https://deno.land/x/cliffy/ansi/tty.ts";
 *
 * tty.cursorUp.cursorLeft.eraseDown();
 * ```
 *
 * @example Create a new instance
 *
 * ```typescript
 * import { tty } from "https://deno.land/x/cliffy/ansi/tty.ts";
 *
 * const myTty = tty({
 *   writer: Deno.stdout,
 *   reader: Deno.stdin,
 * });
 *
 * myTty.cursorUp.cursorLeft.eraseDown();
 * ```
 */
export const tty: Tty = factory();

const encoder = new TextEncoder();

function factory(options?: TtyOptions): Tty {
  let result = "";
  let stack: Array<[Property, Args]> = [];
  const writer = options?.writer ?? { writeSync };
  const reader = options?.reader ?? { readSync, setRaw };

  const tty: Tty = function (
    this: TtyChain | undefined,
    ...args: Args | [TtyOptions]
  ): TtyChain {
    if (this) {
      update(args);
      writer.writeSync(encoder.encode(result));
      return this;
    }
    return factory(args[0] as TtyOptions ?? options);
  } as Tty;

  tty.text = function (text: string): TtyChain {
    stack.push([text, []]);
    update();
    writer.writeSync(encoder.encode(result));
    return this;
  };

  tty.getCursorPosition = (): Cursor => getCursorPosition({ writer, reader });

  const methodList: Array<[PropertyNames, Property]> = Object.entries(
    ansiEscapes,
  ) as Array<[PropertyNames, Property]>;

  for (const [name, method] of methodList) {
    if (name === "cursorPosition") {
      continue;
    }
    Object.defineProperty(tty, name, {
      get(this: TtyChain) {
        stack.push([method, []]);
        return this;
      },
    });
  }

  return tty;

  function update(args?: Args) {
    if (!stack.length) {
      return;
    }
    if (args) {
      stack[stack.length - 1][1] = args;
    }
    result = stack.reduce(
      (prev: string, [cur, args]: [Property, Args]) =>
        prev + (typeof cur === "string" ? cur : cur.call(tty, ...args)),
      "",
    );
    stack = [];
  }
}

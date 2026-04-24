import { encodeBase64 } from "@std/encoding/base64";
import { getOs } from "@cliffy/internal/runtime/get-os";

/** Escape sequence: `\x1B` */
const ESC = "\x1B";
/** Control sequence intro: `\x1B[` */
const CSI: string = `${ESC}[`;
/** Operating system command: `\x1B]` */
const OSC = `${ESC}]`;
/** Link separator */
const SEP = ";";

/**
 * Ring audio bell: `\u0007`
 *
 * @example Ring audio bell
 *
 * ```ts
 * import { bel } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(bel));
 * ```
 */
export const bel = "\u0007";

/**
 * Get cursor position.
 *
 * @example Get cursor position
 *
 * ```ts
 * import { cursorPosition } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorPosition));
 * ```
 */
export const cursorPosition: string = `${CSI}6n`;

/**
 * Move cursor to x, y, counting from the top left corner.
 *
 * @example Move cursor to top left corner
 *
 * ```ts
 * import { cursorTo } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorTo(0, 0)));
 * ```
 *
 * @param x Position left.
 * @param y Position top.
 */
export function cursorTo(x: number, y?: number): string {
  if (typeof y !== "number") {
    return `${CSI}${x}G`;
  }
  return `${CSI}${y};${x}H`;
}

/**
 * Move cursor by offset.
 *
 * @example Move cursor one line up and one column left
 *
 * ```ts
 * import { cursorMove } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorMove(-1, -1)));
 * ```
 *
 * @param x Offset left.
 * @param y Offset top.
 */
export function cursorMove(x: number, y: number): string {
  let ret = "";

  if (x < 0) {
    ret += `${CSI}${-x}D`;
  } else if (x > 0) {
    ret += `${CSI}${x}C`;
  }

  if (y < 0) {
    ret += `${CSI}${-y}A`;
  } else if (y > 0) {
    ret += `${CSI}${y}B`;
  }

  return ret;
}

/**
 * Move cursor up by n lines.
 *
 * @example Move cursor up by 3 lines
 *
 * ```ts
 * import { cursorUp } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorUp(3)));
 * ```
 *
 * @param count Number of lines.
 */
export function cursorUp(count = 1): string {
  return `${CSI}${count}A`;
}

/**
 * Move cursor down by n lines.
 *
 * @example Move cursor down by 3 lines
 *
 * ```ts
 * import { cursorDown } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorDown(3)));
 * ```
 *
 * @param count Number of lines.
 */
export function cursorDown(count = 1): string {
  return `${CSI}${count}B`;
}

/**
 * Move cursor forward by n lines.
 *
 * @example Move cursor forward by 3 characters
 *
 * ```ts
 * import { cursorForward } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorForward(3)));
 * ```
 *
 * @param count Number of lines.
 */
export function cursorForward(count = 1): string {
  return `${CSI}${count}C`;
}

/**
 * Move cursor backward by n lines.
 *
 * @example Move cursor backward by 3 characters
 *
 * ```ts
 * import { cursorBackward } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorBackward(3)));
 * ```
 *
 * @param count Number of lines.
 */
export function cursorBackward(count = 1): string {
  return `${CSI}${count}D`;
}

/**
 * Move cursor to the beginning of the line n lines down.
 *
 * @example Move cursor down by 2 lines and move cursor to line start
 *
 * ```ts
 * import { cursorNextLine } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorNextLine(2)));
 * ```
 * @param count Number of lines.
 */
export function cursorNextLine(count = 1): string {
  return `${CSI}E`.repeat(count);
}

/**
 * Move cursor to the beginning of the line n lines up.
 *
 * @example Move cursor up by 2 lines and move cursor to line start
 *
 * ```ts
 * import { cursorPrevLine } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorPrevLine(2)));
 * ```
 * @param count Number of lines.
 */
export function cursorPrevLine(count = 1): string {
  return `${CSI}F`.repeat(count);
}

/**
 * Move cursor to first column of current row.
 *
 * @example Move cursor to first column of current row
 *
 * ```ts
 * import { cursorLeft } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorLeft));
 * ```
 */
export const cursorLeft: string = `${CSI}G`;

/**
 * Hide cursor.
 *
 * @example Hide cursor
 *
 * ```ts
 * import { cursorHide } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorHide));
 * ```
 */
export const cursorHide: string = `${CSI}?25l`;

/**
 * Show cursor.
 *
 * @example Show cursor
 *
 * ```ts
 * import { cursorShow } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorShow));
 * ```
 */
export const cursorShow: string = `${CSI}?25h`;

/**
 * Save cursor.
 *
 * @example Save cursor
 *
 * ```ts
 * import { cursorSave } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorSave));
 * ```
 */
export const cursorSave: string = `${ESC}7`;

/**
 * Restore cursor.
 *
 * @example Restore cursor
 *
 * ```ts
 * import { cursorRestore } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(cursorRestore));
 * ```
 */
export const cursorRestore: string = `${ESC}8`;

/**
 * Scroll window up by n lines.
 *
 * @example Scroll up by 2 lines
 *
 * ```ts
 * import { scrollUp } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(scrollUp(2)));
 * ```
 * @param count Number of lines.
 */
export function scrollUp(count = 1): string {
  return `${CSI}S`.repeat(count);
}

/**
 * Scroll window down by n lines.
 *
 * @example Scroll down by 2 lines
 *
 * ```ts
 * import { scrollDown } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(scrollDown(2)));
 * ```
 * @param count Number of lines.
 */
export function scrollDown(count = 1): string {
  return `${CSI}T`.repeat(count);
}

/**
 * Clear screen.
 *
 * @example Clear screen
 *
 * ```ts
 * import { eraseScreen } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(eraseScreen));
 * ```
 */
export const eraseScreen: string = `${CSI}2J`;

/**
 * Clear screen up by n lines.
 *
 * @example Clear screen up by 2 lines
 *
 * ```ts
 * import { eraseUp } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(eraseUp(2)));
 * ```
 *
 * @param count Number of lines.
 */
export function eraseUp(count = 1): string {
  return `${CSI}1J`.repeat(count);
}

/**
 * Clear screen down by n lines.
 *
 * @example Clear screen down by 2 lines
 *
 * ```ts
 * import { eraseDown } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(eraseDown(2)));
 * ```
 * @param count Number of lines.
 */
export function eraseDown(count = 1): string {
  return `${CSI}0J`.repeat(count);
}

/**
 * Clear current line.
 *
 * @example Clear current line
 *
 * ```ts
 * import { eraseLine } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(eraseLine));
 * ```
 */
export const eraseLine: string = `${CSI}2K`;

/**
 * Clear to line end.
 *
 * @example Clear to line end
 *
 * ```ts
 * import { eraseLineEnd } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(eraseLineEnd));
 * ```
 */
export const eraseLineEnd: string = `${CSI}0K`;

/**
 * Clear to line start.
 *
 * @example Clear to line start
 *
 * ```ts
 * import { eraseLineStart } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(eraseLineStart));
 * ```
 */
export const eraseLineStart: string = `${CSI}1K`;

/**
 * Clear screen and move cursor by n lines up and move cursor to first column.
 *
 * @param count Number of lines.
 */
export function eraseLines(count: number): string {
  let clear = "";
  for (let i = 0; i < count; i++) {
    clear += eraseLine + (i < count - 1 ? cursorUp() : "");
  }
  clear += cursorLeft;
  return clear;
}

/**
 * Clear the terminal screen. (Viewport)
 *
 * @example Clear the terminal screen
 *
 * ```ts
 * import { clearScreen } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(clearScreen));
 * ```
 */
export const clearScreen = "\u001Bc";

/**
 * Clear the whole terminal, including scrollback buffer.
 * (Not just the visible part of it).
 *
 * @example Clear the whole terminal
 *
 * ```ts
 * import { clearTerminal } from "@cliffy/ansi/ansi-escapes";
 *
 * Deno.stdout.writeSync(new TextEncoder().encode(clearTerminal));
 * ```
 */
export const clearTerminal: string = getOs() === "windows"
  ? `${eraseScreen}${CSI}0f`
  // 1. Erases the screen (Only done in case `2` is not supported)
  // 2. Erases the whole screen including scrollback buffer
  // 3. Moves cursor to the top-left position
  // More info: https://www.real-world-systems.com/docs/ANSIcode.html
  : `${eraseScreen}${CSI}3J${CSI}H`;

/**
 * Create link.
 *
 * @example Create link
 *
 * ```ts
 * import { link } from "@cliffy/ansi/ansi-escapes";
 *
 * console.log(
 *   link("Click me.", "https://deno.land"),
 * );
 * ```
 * @param text Link text.
 * @param url Link url.
 */
export function link(text: string, url: string): string {
  return [
    OSC,
    "8",
    SEP,
    SEP,
    url,
    bel,
    text,
    OSC,
    "8",
    SEP,
    SEP,
    bel,
  ].join("");
}

/** Image options. */
export interface ImageOptions {
  /** Image width. */
  width?: number;
  /** Image height. */
  height?: number;
  /** Preserve aspect ratio. */
  preserveAspectRatio?: boolean;
}

/**
 * Create image.
 *
 * @example Create image
 *
 * ```ts
 * import { image } from "@cliffy/ansi/ansi-escapes";
 *
 * const response = await fetch("https://deno.land/images/hashrock_simple.png");
 * const imageBuffer: ArrayBuffer = await response.arrayBuffer();
 * console.log(
 *   image(imageBuffer),
 * );
 * ```
 * @param buffer  Image buffer.
 * @param options Image options.
 */
export function image(
  buffer: string | ArrayBuffer,
  options?: ImageOptions,
): string {
  let ret = `${OSC}1337;File=inline=1`;

  if (options?.width) {
    ret += `;width=${options.width}`;
  }

  if (options?.height) {
    ret += `;height=${options.height}`;
  }

  if (options?.preserveAspectRatio === false) {
    ret += ";preserveAspectRatio=0";
  }

  return ret + ":" + encodeBase64(buffer) + bel;
}

const ESCAPE_MAP: Partial<Record<string, string>> = Object.freeze({
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\v": "\\v",
});
const EXCLUDE_LIST = ["\n", "\r"];
const ESCAPE_PATTERN = new RegExp("[\x00-\x1f\x7f-\x9f]", "g");
const QUOTES = ['"', "'", "`"];

export function quoteString(str: string): string {
  const quote = QUOTES.find(
    (c) => !str.includes(c),
  ) ?? QUOTES[0];
  const escapePattern = new RegExp(`(?=[${quote}\\\\])`, "g");
  str = str.replace(escapePattern, "\\");
  str = replaceEscapeSequences(str);
  return `${quote}${str}${quote}`;
}

function replaceEscapeSequences(str: string): string {
  return str
    .replace(
      ESCAPE_PATTERN,
      (sequence) =>
        EXCLUDE_LIST.includes(sequence)
          ? sequence
          : ESCAPE_MAP[sequence] || "\\x" + sequence
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0"),
    );
}

import { cyan, gray, green, magenta, red, yellow } from "@std/fmt/colors";

const MAX_ARRAY_DEPTH = 1;
const MAX_ARRAY_ENTRIES = 10;

export function formatValue(value: unknown): string {
  return format(value, 0);
}

function format(value: unknown, depth: number): string {
  switch (typeof value) {
    case "string":
      return green(JSON.stringify(value));
    case "number":
    case "bigint":
    case "boolean":
      return yellow(`${value}`);
    case "undefined":
      return gray("undefined");
  }

  if (value === null) {
    return gray("null");
  }

  if (value instanceof Date) {
    return magenta(
      isNaN(value.getTime()) ? "Invalid Date" : value.toISOString(),
    );
  }

  if (value instanceof RegExp) {
    return red(`${value}`);
  }

  if (Array.isArray(value)) {
    return depth > MAX_ARRAY_DEPTH ? cyan("[...]") : formatArray(value, depth);
  }

  return cyan(`[${kindOf(value)}]`);
}

function formatArray(values: Array<unknown>, depth: number): string {
  const items = values
    .slice(0, MAX_ARRAY_ENTRIES)
    .map((value) => format(value, depth + 1));

  const rest = values.length - items.length;
  if (rest > 0) {
    items.push(`... ${rest} more`);
  }

  return items.length ? `[ ${items.join(", ")} ]` : "[]";
}

function kindOf(value: unknown): string {
  if (typeof value === "function") {
    return "Function";
  }

  return Object.getPrototypeOf(value)?.constructor?.name ?? "Object";
}

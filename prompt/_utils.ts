/** Alias method for Number constructor. */
export function parseNumber(value: unknown): number {
  return Number(value);
}

export type WidenType<T> = T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T;

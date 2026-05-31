import { levenshteinDistance } from "@std/text/levenshtein-distance";

export type SearchMode = "substring" | "fuzzy" | "typo" | "all";

/** Result of a successful {@linkcode search} match. */
export interface SearchMatch {
  /** Match score. Lower is a better match. */
  score: number;
  /** Indices of the matched characters within the searched value. */
  positions: Array<number>;
}

// Each strategy lives in its own score band so that a substring match always
// ranks above a fuzzy match, which always ranks above a typo-tolerant match,
// regardless of their inner scores.
const TIER = 1_000_000;
const SUBSTRING_TIER = 0;
const FUZZY_TIER = TIER;
const TYPO_TIER = TIER * 2;

// Typo tolerance only kicks in for inputs of at least this length.
const MIN_TYPO_LENGTH = 3;

/** Match `input` against `value` using the given strategy. */
export function search(
  input: string,
  value: string,
  mode: SearchMode = "fuzzy",
): SearchMatch | undefined {
  if (input === "") {
    return { score: 0, positions: [] };
  }

  const query = input.toLowerCase();
  const text = value.toLowerCase();

  const substring = matchSubstring(query, text);
  if (substring) {
    return substring;
  }
  if (mode === "substring") {
    return undefined;
  }

  if (mode === "fuzzy" || mode === "all") {
    const subsequence = matchSubsequence(query, text);
    if (subsequence) {
      return subsequence;
    }
  }

  if (mode === "typo" || mode === "all") {
    return matchTypo(query, text);
  }

  return undefined;
}

/**
 * Search `value` for `input` and apply colors to the matched characters.
 * Matched characters get `matchColor`; the rest gets `restColor`.
 * Returns `value` unstyled when there is no match.
 */
export function highlight(
  input: string,
  value: string | number,
  mode: SearchMode,
  matchColor: (val: string) => string,
  restColor: (val: string) => string,
): string {
  const text = value.toString();
  const match = search(input, text, mode);

  if (!match) {
    return text;
  }

  return highlightMatch(text, match.positions, matchColor, restColor);
}

/** Highlight the matched `positions` within `value`. */
export function highlightMatch(
  value: string,
  positions: Array<number>,
  matchColor: (value: string) => string,
  restColor: (value: string) => string,
): string {
  if (!positions.length) {
    return restColor(value);
  }

  const matched = new Set(positions);
  let result = "";
  let index = 0;

  while (index < value.length) {
    const isMatch = matched.has(index);
    let end = index;

    while (end < value.length && matched.has(end) === isMatch) {
      end++;
    }
    const chunk = value.slice(index, end);
    result += isMatch ? matchColor(chunk) : restColor(chunk);
    index = end;
  }

  return result;
}

function matchSubstring(query: string, text: string): SearchMatch | undefined {
  const index = text.indexOf(query);

  if (index === -1) {
    return undefined;
  }
  const positions: Array<number> = [];

  for (let i = 0; i < query.length; i++) {
    positions.push(index + i);
  }

  return { score: SUBSTRING_TIER + index, positions };
}

function matchSubsequence(
  query: string,
  text: string,
): SearchMatch | undefined {
  const positions: Array<number> = [];
  let queryIndex = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      positions.push(i);
      queryIndex++;
    }
  }
  if (queryIndex < query.length) {
    return undefined;
  }
  const first = positions[0];
  const last = positions[positions.length - 1];
  const gaps = last - first - (query.length - 1);

  return {
    score: FUZZY_TIER + gaps * 1000 + first,
    positions,
  };
}

function matchTypo(query: string, text: string): SearchMatch | undefined {
  if (query.length < MIN_TYPO_LENGTH) {
    return undefined;
  }
  const maxDistance = Math.floor(query.length / 4) + 1;
  const minLength = Math.max(1, query.length - maxDistance);
  const maxLength = query.length + maxDistance;

  let bestDistance = Infinity;
  let bestStart = -1;
  let bestLength = 0;

  for (let start = 0; start < text.length; start++) {
    for (
      let length = minLength;
      length <= maxLength && start + length <= text.length;
      length++
    ) {
      const window = text.slice(start, start + length);
      const distance = levenshteinDistance(window, query);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestStart = start;
        bestLength = length;
      }
    }
  }

  if (bestStart === -1 || bestDistance > maxDistance) {
    return undefined;
  }

  const positions: Array<number> = [];
  for (let i = bestStart; i < bestStart + bestLength; i++) {
    positions.push(i);
  }

  return {
    score: TYPO_TIER + bestDistance * 1000 + bestStart,
    positions,
  };
}

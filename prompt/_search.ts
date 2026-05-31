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
    return matchTypo(query, text, mode === "all");
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

function matchTypo(
  query: string,
  text: string,
  useWordSubsequence: boolean,
): SearchMatch | undefined {
  const queryWords = query.split(/\s+/).filter((w) => w.length > 0);

  if (!queryWords.some((w) => w.length >= MIN_TYPO_LENGTH)) {
    return undefined;
  }

  const textWords: Array<{ word: string; start: number }> = [];
  const wordRe = /\S+/g;
  let m;
  while ((m = wordRe.exec(text)) !== null) {
    textWords.push({ word: m[0], start: m.index });
  }

  let textIndex = 0;
  const positions: Array<number> = [];
  let totalDistance = 0;

  for (const queryWord of queryWords) {
    // Short words require exact match; longer words allow per-word tolerance
    // capped at 2 so "order" never matches "and" (distance 4).
    const maxDist = queryWord.length >= MIN_TYPO_LENGTH
      ? Math.min(Math.floor(queryWord.length / 4) + 1, 2)
      : 0;
    let found = false;

    while (textIndex < textWords.length) {
      const { word, start } = textWords[textIndex++];

      if (useWordSubsequence) {
        const seqPos = wordSubsequencePositions(queryWord, word, start);
        if (seqPos) {
          positions.push(...seqPos);
          found = true;
          break;
        }
      }

      const dist = levenshteinDistance(word, queryWord);
      if (dist <= maxDist) {
        for (let i = start; i < start + word.length; i++) {
          positions.push(i);
        }
        totalDistance += dist;
        found = true;
        break;
      }
    }

    if (!found) {
      return undefined;
    }
  }

  return {
    score: TYPO_TIER + totalDistance * 1000 + positions[0],
    positions,
  };
}

function wordSubsequencePositions(
  queryWord: string,
  textWord: string,
  offset: number,
): Array<number> | undefined {
  const positions: Array<number> = [];
  let queryIndex = 0;

  for (let i = 0; i < textWord.length && queryIndex < queryWord.length; i++) {
    if (textWord[i] === queryWord[queryIndex]) {
      positions.push(offset + i);
      queryIndex++;
    }
  }

  return queryIndex === queryWord.length ? positions : undefined;
}

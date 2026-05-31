import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertExists } from "@std/assert";
import {
  highlightMatch,
  search,
  type SearchMatch,
  type SearchMode,
} from "../_search.ts";

function matchOrThrow(
  input: string,
  value: string,
  mode: SearchMode,
): SearchMatch {
  const match = search(input, value, mode);
  assertExists(
    match,
    `expected "${input}" to match "${value}" in ${mode} mode`,
  );
  return match;
}

test("search: should match a substring", () => {
  const match = search("str", "structure", "substring");
  assertEquals(match, { score: 0, positions: [0, 1, 2] });
});

test("search: should rank an earlier substring higher", () => {
  const early = matchOrThrow("ba", "bar", "substring");
  const late = matchOrThrow("ba", "foobar", "substring");
  assertEquals(early.score < late.score, true);
});

test("search: should not match a non-substring in substring mode", () => {
  assertEquals(search("strubu", "structure-builder", "substring"), undefined);
});

test("search: should fuzzy match a subsequence", () => {
  const match = matchOrThrow("strubu", "structure-builder", "fuzzy");
  assertEquals(match.positions, [0, 1, 2, 3, 10, 11]);
});

test("search: should rank a contiguous match above a scattered one", () => {
  const contiguous = matchOrThrow("abc", "abcxxxxxx", "fuzzy");
  const scattered = matchOrThrow("abc", "axbxcxxxx", "fuzzy");
  assertEquals(contiguous.score < scattered.score, true);
});

test("search: should prefer a substring over a fuzzy match", () => {
  const substring = matchOrThrow("ab", "ab", "fuzzy");
  const fuzzy = matchOrThrow("ab", "axb", "fuzzy");
  assertEquals(substring.score < fuzzy.score, true);
});

test("search: should not typo match in fuzzy mode", () => {
  assertEquals(search("stroberry", "strawberry", "fuzzy"), undefined);
});

test("search: should typo match in all mode", () => {
  assertExists(search("stroberry", "strawberry", "all"));
});

test("search: should typo match in typo mode", () => {
  assertExists(search("stroberry", "strawberry", "typo"));
});

test("search: should match mixed typo and abbreviation per word in all mode", () => {
  assertExists(search("harrry ott", "harry potter", "all"));
  assertEquals(search("harrry ott", "harry potter", "typo"), undefined);
});

test("search: should not typo match across word boundaries", () => {
  assertEquals(
    search(
      "harry potter order",
      "harry potter and the philosopher's stone",
      "typo",
    ),
    undefined,
  );
});

test("search: should not fuzzy match in typo mode", () => {
  const value = "axxxxxxxxbxxxxxxxxc";
  assertExists(search("abc", value, "fuzzy"));
  assertEquals(search("abc", value, "typo"), undefined);
});

test("search: should still substring match in typo mode", () => {
  const match = matchOrThrow("str", "structure", "typo");
  assertEquals(match, { score: 0, positions: [0, 1, 2] });
});

test("search: should rank substring above fuzzy above typo", () => {
  const substring = matchOrThrow("straw", "strawberry", "all");
  const fuzzy = matchOrThrow("stwbry", "strawberry", "all");
  const typo = matchOrThrow("stroberry", "strawberry", "all");
  assertEquals(substring.score < fuzzy.score, true);
  assertEquals(fuzzy.score < typo.score, true);
});

test("search: should match everything for an empty input", () => {
  assertEquals(search("", "anything", "all"), { score: 0, positions: [] });
});

test("search: should match case-insensitively", () => {
  const match = matchOrThrow("STR", "Structure", "substring");
  assertEquals(match.positions, [0, 1, 2]);
});

test("highlightMatch: should wrap matched characters", () => {
  const result = highlightMatch(
    "structure",
    [0, 1, 2],
    (value) => `<${value}>`,
    (value) => value,
  );
  assertEquals(result, "<str>ucture");
});

test("highlightMatch: should group consecutive runs", () => {
  const result = highlightMatch(
    "abcde",
    [0, 1, 3],
    (value) => `[${value}]`,
    (value) => `(${value})`,
  );
  assertEquals(result, "[ab](c)[d](e)");
});

test("highlightMatch: should color the whole value when nothing matches", () => {
  const result = highlightMatch(
    "abc",
    [],
    (value) => `[${value}]`,
    (value) => `(${value})`,
  );
  assertEquals(result, "(abc)");
});

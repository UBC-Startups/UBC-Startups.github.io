import { expect, test } from "@playwright/test";
import { countWords } from "../../../lib/events/word-count";

function words(count: number, separator = " "): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(
    separator,
  );
}

test("counts zero words for empty or whitespace-only text", () => {
  expect(countWords("")).toBe(0);
  expect(countWords("   ")).toBe(0);
  expect(countWords("\t\n  \r\n")).toBe(0);
});

test("counts words separated by spaces, tabs, and newlines", () => {
  expect(countWords("one two three")).toBe(3);
  expect(countWords("one\ttwo\tthree")).toBe(3);
  expect(countWords("one\ntwo\r\nthree")).toBe(3);
  expect(countWords("  one   two \n three  ")).toBe(3);
});

test("counts Unicode whitespace as a word separator", () => {
  expect(countWords("one\u00a0two\u2003three")).toBe(3);
});

test("counts a very long token as one word", () => {
  expect(countWords("a".repeat(500))).toBe(1);
  expect(countWords(`${"a".repeat(250)} ${"b".repeat(250)}`)).toBe(2);
});

test("keeps punctuation, hyphens, and apostrophes inside one token", () => {
  expect(countWords("hello, world!")).toBe(2);
  expect(countWords("state-of-the-art don't")).toBe(2);
});

test("counts the 0, 149, 150, and 151 word boundaries", () => {
  expect(countWords(words(0))).toBe(0);
  expect(countWords(words(149))).toBe(149);
  expect(countWords(words(150))).toBe(150);
  expect(countWords(words(151))).toBe(151);
});

test("counts mixed whitespace at the limit", () => {
  expect(countWords(words(150, "\t\n"))).toBe(150);
  expect(countWords(words(151, " \n\t"))).toBe(151);
});

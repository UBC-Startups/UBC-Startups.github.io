// Counts whitespace-separated words for the shared client/server contract.
// Punctuation, hyphens, and apostrophes inside a token stay part of that word.
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}

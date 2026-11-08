import type { Entry } from './models';

/**
 * Lowercase and strip accents, so "Abuela" finds "abuela" and "reflexion"
 * finds "reflexión". (NFD splits "ó" into "o" + an accent mark, then the marks go.)
 */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Everything you wrote in an entry, as one string to search. */
function searchableText(entry: Entry): string {
  return [
    entry.title,
    entry.body,
    entry.whatHappened,
    entry.thoughts,
    entry.feelingsNote,
    entry.reframe,
    entry.gratitude,
    ...entry.customFeelings,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * The entries that contain every word of the query, anywhere in what you wrote,
 * ignoring case and accents. An empty query returns them all, in the same order.
 */
export function searchEntries(entries: readonly Entry[], query: string): Entry[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...entries];
  return entries.filter((entry) => {
    const text = fold(searchableText(entry));
    return words.every((word) => text.includes(word));
  });
}

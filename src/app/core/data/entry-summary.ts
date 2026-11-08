import type { Entry } from './models';
import type { ReflectionPart } from './reflection-parts';

/**
 * The words to show under an entry's title in lists: the body of free writing,
 * or the first part of a reflection that has something in it.
 */
export function entryPreview(entry: Entry): string | null {
  const candidates =
    entry.kind === 'free'
      ? [entry.body]
      : [entry.whatHappened, entry.thoughts, entry.feelingsNote, entry.reframe, entry.gratitude];
  return candidates.find((text) => text?.trim()) ?? null;
}

/** Where an entry opens: a draft reflection resumes where it stopped; the rest are read. */
export function entryLink(entry: Entry): string[] {
  return entry.kind === 'reflection' && entry.status === 'draft'
    ? ['/reflect', entry.id, String(entry.currentStep ?? 1)]
    : ['/entry', entry.id];
}

/** Nothing has been written or chosen, so there's nothing worth keeping. */
export function isBlank(entry: Entry): boolean {
  const texts = [
    entry.title,
    entry.body,
    entry.whatHappened,
    entry.thoughts,
    entry.feelingsNote,
    entry.reframe,
    entry.gratitude,
  ];
  const lists = [entry.feelings, entry.customFeelings, entry.patterns];
  return texts.every((text) => !text?.trim()) && lists.every((list) => list.length === 0);
}

/** Whether a reflection part has anything in it. */
export function partHasAnswer(part: ReflectionPart, entry: Entry): boolean {
  switch (part.kind) {
    case 'feelings':
      return (
        entry.feelings.length + entry.customFeelings.length > 0 || !!entry.feelingsNote?.trim()
      );
    case 'patterns':
      return entry.patterns.length > 0;
    default:
      return !!entry[part.key]?.trim();
  }
}

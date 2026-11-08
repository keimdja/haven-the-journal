/** What kind of page a part shows. */
export type PartKind = 'text' | 'feelings' | 'patterns';

/** A reflection part's step number, used in `reflect/:id/:part` and `entries.current_step`. */
export type ReflectionStep = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The six parts of a reflection, in order. `key` names the part in the copy
 * (question, helper, nudges); for text parts it's also the `Entry` field the
 * answer is saved in. Part 3 saves `feelings`, `customFeelings` and `feelingsNote`;
 * part 4 saves `patterns`.
 */
export const REFLECTION_PARTS = [
  { step: 1, key: 'whatHappened', kind: 'text' },
  { step: 2, key: 'thoughts', kind: 'text' },
  { step: 3, key: 'feelings', kind: 'feelings' },
  { step: 4, key: 'patterns', kind: 'patterns' },
  { step: 5, key: 'reframe', kind: 'text' },
  { step: 6, key: 'gratitude', kind: 'text' },
] as const satisfies readonly { step: ReflectionStep; key: string; kind: PartKind }[];

export type ReflectionPart = (typeof REFLECTION_PARTS)[number];
export type ReflectionPartKey = ReflectionPart['key'];

/** The part for a step, or undefined if the number isn't 1–6 (e.g. a mistyped URL). */
export function partForStep(step: number): ReflectionPart | undefined {
  return REFLECTION_PARTS.find((part) => part.step === step);
}

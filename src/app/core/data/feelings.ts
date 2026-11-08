/** Lighter feelings show in sage, heavier ones in clay. */
export type FeelingWeight = 'light' | 'heavy';

/**
 * The 14 preset feelings, in the order they're offered. The keys match the
 * check on `entries.feelings` in supabase/001_schema.sql; labels live in the copy.
 */
export const FEELINGS = [
  { key: 'calm', weight: 'light' },
  { key: 'content', weight: 'light' },
  { key: 'grateful', weight: 'light' },
  { key: 'hopeful', weight: 'light' },
  { key: 'tender', weight: 'light' },
  { key: 'relieved', weight: 'light' },
  { key: 'proud', weight: 'light' },
  { key: 'tired', weight: 'heavy' },
  { key: 'restless', weight: 'heavy' },
  { key: 'unsure', weight: 'heavy' },
  { key: 'anxious', weight: 'heavy' },
  { key: 'sad', weight: 'heavy' },
  { key: 'frustrated', weight: 'heavy' },
  { key: 'lonely', weight: 'heavy' },
] as const satisfies readonly { key: string; weight: FeelingWeight }[];

export type FeelingKey = (typeof FEELINGS)[number]['key'];

export const FEELING_KEYS: readonly FeelingKey[] = FEELINGS.map((feeling) => feeling.key);

const WEIGHTS = new Map<FeelingKey, FeelingWeight>(FEELINGS.map((f) => [f.key, f.weight]));

export function feelingWeight(key: FeelingKey): FeelingWeight {
  return WEIGHTS.get(key) ?? 'light';
}

/** Feelings you type yourself: at most 20 per entry (the database's limit), 40 characters each. */
export const CUSTOM_FEELINGS_MAX = 20;
export const CUSTOM_FEELING_MAX_LENGTH = 40;

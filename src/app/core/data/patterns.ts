/**
 * The 11 thinking patterns of reflection part 4, in the order they're offered.
 * The keys match the check on `entries.patterns` in supabase/001_schema.sql;
 * labels and example thoughts live in the copy.
 */
export const PATTERN_KEYS = [
  'minimize_magnify',
  'predicting_future',
  'reading_minds',
  'catastrophizing',
  'extreme_thinking',
  'jumping_to_conclusions',
  'blaming_myself',
  'blaming_others',
  'not_questioning',
  'feelings_as_facts',
  'should_statements',
] as const;

export type PatternKey = (typeof PATTERN_KEYS)[number];

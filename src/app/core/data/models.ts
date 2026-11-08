import type { Lang } from '../i18n/i18n';
import type { FeelingKey } from './feelings';
import type { PatternKey } from './patterns';
import type { ReflectionStep } from './reflection-parts';

export type { FeelingKey } from './feelings';
export type { PatternKey } from './patterns';
export type { ReflectionStep } from './reflection-parts';

/** Free writing, or a guided six-part reflection. */
export type EntryKind = 'free' | 'reflection';

/** Reflections stay drafts until saved from the review; free writing is complete. */
export type EntryStatus = 'draft' | 'complete';

/**
 * One journal entry: the `entries` table in camelCase (entry-mapper.ts converts).
 * Dates are ISO strings, as Supabase sends them; they also sort correctly in IndexedDB.
 */
export interface Entry {
  /** Made on the device (crypto.randomUUID()), so entries exist before they sync. */
  id: string;
  kind: EntryKind;
  title: string | null;

  /** Free writing. */
  body: string | null;

  // Reflection parts 1–6.
  whatHappened: string | null;
  thoughts: string | null;
  /** Preset chips, on both kinds of entry. */
  feelings: FeelingKey[];
  /** Feelings typed by hand, stored as written and never translated. */
  customFeelings: string[];
  feelingsNote: string | null;
  patterns: PatternKey[];
  reframe: string | null;
  gratitude: string | null;

  status: EntryStatus;
  /** For a draft reflection, the part to resume at. */
  currentStep: ReflectionStep | null;

  /** The entry's date in the app. */
  writtenAt: string;
  /** Last edit on any device; the newest edit wins. */
  clientUpdatedAt: string;
  /** Set by the server when the row is stored; null until the entry first syncs. */
  updatedAt: string | null;
  /** Set when deleted. The row stays (emptied) so other devices learn about it. */
  deletedAt: string | null;
}

/** Your settings: the `profiles` table in camelCase. */
export interface Profile {
  displayName: string;
  language: Lang;
  hidePreviews: boolean;
}

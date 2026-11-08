import type { LocalEntry } from './local-db';
import type {
  Entry,
  EntryKind,
  EntryStatus,
  FeelingKey,
  PatternKey,
  ReflectionStep,
} from './models';

/** A row of the `entries` table, as Supabase sends and receives it (snake_case). */
export interface EntryRow {
  id: string;
  kind: EntryKind;
  title: string | null;
  body: string | null;
  what_happened: string | null;
  thoughts: string | null;
  feelings: FeelingKey[];
  custom_feelings: string[];
  feelings_note: string | null;
  patterns: PatternKey[];
  reframe: string | null;
  gratitude: string | null;
  status: EntryStatus;
  current_step: ReflectionStep | null;
  written_at: string;
  client_updated_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * What the app sends when pushing: the row without `updated_at` (the server
 * stamps it) and without `user_id` (the database fills it from your session).
 */
export type EntryRowUpload = Omit<EntryRow, 'updated_at'>;

/** A local entry ready to push. The `dirty` flag stays on this device. */
export function toRow(entry: Entry | LocalEntry): EntryRowUpload {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    what_happened: entry.whatHappened,
    thoughts: entry.thoughts,
    feelings: entry.feelings,
    custom_feelings: entry.customFeelings,
    feelings_note: entry.feelingsNote,
    patterns: entry.patterns,
    reframe: entry.reframe,
    gratitude: entry.gratitude,
    status: entry.status,
    current_step: entry.currentStep,
    written_at: entry.writtenAt,
    client_updated_at: entry.clientUpdatedAt,
    deleted_at: entry.deletedAt,
  };
}

/**
 * Postgres sends times as "2026-10-20 20:40:00.123456+00"; the app keeps them as
 * "2026-10-20T20:40:00.123Z" so they compare and sort as plain strings.
 */
function iso(time: string): string {
  return new Date(time).toISOString();
}

/** A pulled row as an entry. Extra columns (like `user_id`) are ignored. */
export function fromRow(row: EntryRow): Entry {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    whatHappened: row.what_happened,
    thoughts: row.thoughts,
    feelings: row.feelings ?? [],
    customFeelings: row.custom_feelings ?? [],
    feelingsNote: row.feelings_note,
    patterns: row.patterns ?? [],
    reframe: row.reframe,
    gratitude: row.gratitude,
    status: row.status,
    currentStep: row.current_step,
    writtenAt: iso(row.written_at),
    clientUpdatedAt: iso(row.client_updated_at),
    updatedAt: iso(row.updated_at),
    deletedAt: row.deleted_at ? iso(row.deleted_at) : null,
  };
}

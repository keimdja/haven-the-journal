import type { LocalEntry } from './local-db';
import type { Entry } from './models';

/** What to do with a pulled entry. */
export type Resolution = 'keep-local' | 'take-remote';

/**
 * The keep-or-overwrite rule for a pulled entry, newest edit wins:
 *
 * - No local copy, or it's clean → take the server's version.
 * - Local copy has unpushed changes newer than the server's → keep it; the next
 *   push sends it up.
 * - Otherwise (the server's is newer, or it's the very version we pushed) → take
 *   the server's.
 *
 * Times are ISO strings in the same format (see entry-mapper), so they compare as text.
 */
export function resolve(local: LocalEntry | undefined, remote: Entry): Resolution {
  if (local?.dirty === 1 && local.clientUpdatedAt > remote.clientUpdatedAt) return 'keep-local';
  return 'take-remote';
}

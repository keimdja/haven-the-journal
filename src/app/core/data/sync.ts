import { Injectable, inject, signal } from '@angular/core';

import { Auth } from '../auth/auth';
import { SUPABASE } from '../auth/supabase';
import type { SaveState } from '../../shared/ui/save-status/save-status';
import { EntryRow, fromRow, toRow } from './entry-mapper';
import { LocalDb, LocalEntry } from './local-db';
import type { Entry } from './models';
import { resolve } from './resolve';

/** Rows per request, so a first push of a big journal stays well inside request limits. */
const PUSH_BATCH = 500;

/** Supabase returns at most 1,000 rows per request; pull in pages of exactly that. */
const PULL_PAGE = 1000;

/**
 * Pull a little further back than the last pull, so a row whose transaction
 * committed slightly late isn't skipped. Pulling a row twice is harmless.
 */
const PULL_OVERLAP_MS = 60_000;

/** A request that failed: status 0 means it never reached the server. */
interface FailedRequest {
  status: number;
  error: { message: string } | null;
}

/** Thrown when Supabase can't be reached, so callers can show "offline" rather than an error. */
export class OfflineError extends Error {}

/**
 * Copies changes between this device and Supabase: `push()` uploads what
 * changed here, `pull()` downloads what changed elsewhere.
 *
 * `state` drives the save-status line: saving, saved, offline, or error.
 */
@Injectable({ providedIn: 'root' })
export class Sync {
  private readonly db = inject(LocalDb);
  private readonly supabase = inject(SUPABASE);
  private readonly auth = inject(Auth);

  private readonly current = signal<SaveState>('saved');
  readonly state = this.current.asReadonly();

  /**
   * Uploads every dirty entry. An entry is marked clean only if it wasn't
   * edited again while the upload was in flight; otherwise it stays dirty and
   * goes up next time. If the server already holds a newer edit, its trigger
   * keeps that one, and the next pull brings it down.
   */
  async push(): Promise<void> {
    if (!this.auth.session()) return;
    const dirty = await this.db.entries.where('dirty').equals(1).toArray();
    if (dirty.length === 0) return;

    this.current.set('saving');
    try {
      for (let i = 0; i < dirty.length; i += PUSH_BATCH) {
        const batch = dirty.slice(i, i + PUSH_BATCH);
        const result = await this.supabase.db.from('entries').upsert(batch.map(toRow));
        throwIfFailed(result);
        await this.markClean(batch);
      }
      this.current.set('saved');
    } catch (error) {
      this.current.set(error instanceof OfflineError ? 'offline' : 'error');
      throw error;
    }
  }

  /**
   * Downloads entries changed on the server since the last pull, oldest change
   * first, a page at a time until a page comes back short. Each one is kept or
   * taken by `resolve()`. The cursor (`lastPulledAt`) moves only after the last
   * page, so an interrupted pull simply starts over next time.
   */
  async pull(): Promise<void> {
    if (!this.auth.session()) return;
    const cursor = (await this.db.meta.get('lastPulledAt'))?.value as string | undefined;
    const since = cursor ? new Date(Date.parse(cursor) - PULL_OVERLAP_MS).toISOString() : null;

    let newest = cursor ?? null;
    for (let from = 0; ; from += PULL_PAGE) {
      let query = this.supabase.db.from('entries').select('*');
      if (since) query = query.gt('updated_at', since);
      const result = await query
        .order('updated_at')
        .order('id')
        .range(from, from + PULL_PAGE - 1);
      throwIfFailed(result);

      const rows = (result.data ?? []) as EntryRow[];
      const entries = rows.map(fromRow);
      await this.apply(entries);
      for (const entry of entries) {
        if (!newest || entry.updatedAt! > newest) newest = entry.updatedAt;
      }
      if (rows.length < PULL_PAGE) break;
    }

    if (newest && newest !== cursor) await this.db.meta.put({ key: 'lastPulledAt', value: newest });
  }

  private async apply(pulled: Entry[]): Promise<void> {
    await this.db.transaction('rw', this.db.entries, async () => {
      for (const remote of pulled) {
        const local = await this.db.entries.get(remote.id);
        if (resolve(local, remote) === 'take-remote') {
          await this.db.entries.put({ ...remote, dirty: 0 });
        }
      }
    });
  }

  private async markClean(sent: LocalEntry[]): Promise<void> {
    await this.db.transaction('rw', this.db.entries, async () => {
      for (const entry of sent) {
        const now = await this.db.entries.get(entry.id);
        if (now?.dirty === 1 && now.clientUpdatedAt === entry.clientUpdatedAt) {
          await this.db.entries.update(entry.id, { dirty: 0 });
        }
      }
    });
  }
}

function throwIfFailed({ status, error }: FailedRequest): void {
  if (!error) return;
  if (status === 0) throw new OfflineError(error.message);
  throw new Error(error.message);
}

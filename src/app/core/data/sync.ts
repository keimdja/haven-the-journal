import { Injectable, inject, signal } from '@angular/core';

import { Auth } from '../auth/auth';
import { SUPABASE } from '../auth/supabase';
import type { SaveState } from '../../shared/ui/save-status/save-status';
import { toRow } from './entry-mapper';
import { LocalDb, LocalEntry } from './local-db';

/** Rows per request, so a first push of a big journal stays well inside request limits. */
const PUSH_BATCH = 500;

/** A request that failed: status 0 means it never reached the server. */
interface FailedRequest {
  status: number;
  error: { message: string } | null;
}

/** Thrown when Supabase can't be reached, so callers can show "offline" rather than an error. */
export class OfflineError extends Error {}

/**
 * Copies changes between this device and Supabase. This commit adds the push
 * half: every entry marked dirty is uploaded, then marked clean again.
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

import { Injectable } from '@angular/core';
import Dexie, { type EntityTable } from 'dexie';

import type { Entry } from './models';

/**
 * An entry as kept on this device: the server row plus a sync flag.
 * `dirty` is 0 or 1 rather than a boolean because IndexedDB can't index booleans.
 */
export interface LocalEntry extends Entry {
  /** 1 = changed here and not yet pushed to Supabase. */
  dirty: 0 | 1;
}

/** Small values kept beside the entries: sync progress and the cached profile. */
export interface MetaRow {
  key: 'lastPulledAt' | 'profile' | 'profileDirty';
  value: unknown;
}

/**
 * The on-device database (IndexedDB, through Dexie). Every screen reads from
 * here, so the journal works offline; sync copies changes to and from Supabase.
 * Only the entries repository and sync use it directly.
 *
 * Indexes: entries by id (primary key), kind and status for filters, writtenAt
 * for date order, dirty for "what still needs pushing".
 */
@Injectable({ providedIn: 'root' })
export class LocalDb extends Dexie {
  entries!: EntityTable<LocalEntry, 'id'>;
  meta!: EntityTable<MetaRow, 'key'>;

  constructor() {
    super('haven');
    this.version(1).stores({
      entries: 'id, kind, status, writtenAt, dirty',
      meta: 'key',
    });
  }
}

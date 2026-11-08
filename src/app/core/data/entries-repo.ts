import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

import { LocalDb, LocalEntry } from './local-db';
import type { Entry, EntryKind } from './models';

/** A blank entry of the given kind, dated now. Reflections start as a draft at part 1. */
export function blankEntry(kind: EntryKind, now = new Date()): Entry {
  const time = now.toISOString();
  return {
    id: crypto.randomUUID(),
    kind,
    title: null,
    body: null,
    whatHappened: null,
    thoughts: null,
    feelings: [],
    customFeelings: [],
    feelingsNote: null,
    patterns: [],
    reframe: null,
    gratitude: null,
    status: kind === 'reflection' ? 'draft' : 'complete',
    currentStep: kind === 'reflection' ? 1 : null,
    writtenAt: time,
    clientUpdatedAt: time,
    updatedAt: null,
    deletedAt: null,
  };
}

/** Drops the sync flag, so screens only ever see plain entries. */
function toEntry({ dirty: _dirty, ...entry }: LocalEntry): Entry {
  return entry;
}

/**
 * The only way screens read and change entries. Everything happens on this
 * device first (so it works offline); each change is marked dirty for sync to
 * push. Deleted entries are kept as empty tombstones and never listed.
 *
 * The lists are signals that update by themselves whenever an entry is saved
 * anywhere, so Home and Journal stay current without reloading.
 */
@Injectable({ providedIn: 'root' })
export class EntriesRepo {
  private readonly db = inject(LocalDb);

  /** Every entry, newest first by the date it was written. */
  readonly all = toSignal(
    from(
      liveQuery(() =>
        this.db.entries
          .orderBy('writtenAt')
          .reverse()
          .filter((entry) => !entry.deletedAt)
          .toArray()
          .then((entries) => entries.map(toEntry)),
      ),
    ),
    { initialValue: [] as Entry[] },
  );

  /** The latest three, for Home. */
  readonly recent = computed(() => this.all().slice(0, 3));

  /** The reflection you touched last and haven't finished, for Home's resume card. */
  readonly newestDraft = computed(() =>
    this.all()
      .filter((entry) => entry.kind === 'reflection' && entry.status === 'draft')
      .reduce<Entry | undefined>(
        (newest, entry) =>
          !newest || entry.clientUpdatedAt > newest.clientUpdatedAt ? entry : newest,
        undefined,
      ),
  );

  /** Starts a new entry and stores it, so it survives a reload before the first word. */
  async create(kind: EntryKind): Promise<Entry> {
    const entry = blankEntry(kind);
    await this.db.entries.add({ ...entry, dirty: 1 });
    return entry;
  }

  /** The entry, or undefined if it doesn't exist or was deleted. */
  async byId(id: string): Promise<Entry | undefined> {
    const entry = await this.db.entries.get(id);
    return entry && !entry.deletedAt ? toEntry(entry) : undefined;
  }

  /** Stores your latest version and marks it for sync. Returns it with the new edit time. */
  async save(entry: Entry): Promise<Entry> {
    const saved = { ...entry, clientUpdatedAt: new Date().toISOString() };
    await this.db.entries.put({ ...saved, dirty: 1 });
    return saved;
  }

  /**
   * Deletes an entry by turning it into a tombstone: every word is cleared and
   * `deletedAt` set, so the deletion syncs to your other devices and nothing
   * you wrote stays on the server.
   */
  async remove(id: string): Promise<void> {
    const entry = await this.db.entries.get(id);
    if (!entry || entry.deletedAt) return;
    const now = new Date().toISOString();
    await this.db.entries.put({
      ...entry,
      title: null,
      body: null,
      whatHappened: null,
      thoughts: null,
      feelings: [],
      customFeelings: [],
      feelingsNote: null,
      patterns: [],
      reframe: null,
      gratitude: null,
      deletedAt: now,
      clientUpdatedAt: now,
      dirty: 1,
    });
  }
}

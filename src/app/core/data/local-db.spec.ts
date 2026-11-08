import { TestBed } from '@angular/core/testing';

import { LocalDb, LocalEntry } from './local-db';

function entry(id: string, changes: Partial<LocalEntry> = {}): LocalEntry {
  return {
    id,
    kind: 'free',
    title: null,
    body: 'Words',
    whatHappened: null,
    thoughts: null,
    feelings: [],
    customFeelings: [],
    feelingsNote: null,
    patterns: [],
    reframe: null,
    gratitude: null,
    status: 'complete',
    currentStep: null,
    writtenAt: '2026-10-20T20:40:00.000Z',
    clientUpdatedAt: '2026-10-20T20:40:00.000Z',
    updatedAt: null,
    deletedAt: null,
    dirty: 1,
    ...changes,
  };
}

describe('LocalDb', () => {
  let db: LocalDb;

  beforeEach(() => (db = TestBed.inject(LocalDb)));
  afterEach(() => db.delete());

  it('is the "haven" database with entries and meta tables', () => {
    expect(db.name).toBe('haven');
    expect(db.tables.map((table) => table.name).sort()).toEqual(['entries', 'meta']);
  });

  it('stores entries and finds the ones still to push', async () => {
    await db.entries.bulkAdd([entry('a'), entry('b', { dirty: 0 }), entry('c')]);

    expect((await db.entries.get('b'))?.body).toBe('Words');
    const dirtyIds = await db.entries.where('dirty').equals(1).primaryKeys();
    expect(dirtyIds.sort()).toEqual(['a', 'c']);
  });

  it('lists entries newest first by writtenAt', async () => {
    await db.entries.bulkAdd([
      entry('old', { writtenAt: '2026-09-29T12:00:00.000Z' }),
      entry('new', { writtenAt: '2026-10-21T21:12:00.000Z' }),
    ]);
    const ids = await db.entries.orderBy('writtenAt').reverse().primaryKeys();
    expect(ids).toEqual(['new', 'old']);
  });

  it('keeps small values in meta', async () => {
    await db.meta.put({ key: 'lastPulledAt', value: '2026-10-21T00:00:00.000Z' });
    expect((await db.meta.get('lastPulledAt'))?.value).toBe('2026-10-21T00:00:00.000Z');
  });
});

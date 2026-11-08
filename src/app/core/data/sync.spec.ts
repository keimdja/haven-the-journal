import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Session } from '@supabase/auth-js';

import { Auth } from '../auth/auth';
import { SUPABASE } from '../auth/supabase';
import { blankEntry } from './entries-repo';
import { EntryRow, toRow } from './entry-mapper';
import { LocalDb, LocalEntry } from './local-db';
import { OfflineError, Sync } from './sync';

const ok = { status: 201, error: null };

describe('Sync.push', () => {
  let db: LocalDb;

  function setup(signedIn = true) {
    const upsert = vi.fn().mockResolvedValue(ok);
    const from = vi.fn(() => ({ upsert }));
    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE, useValue: { db: { from } } },
        { provide: Auth, useValue: { session: signal(signedIn ? ({} as Session) : null) } },
      ],
    });
    db = TestBed.inject(LocalDb);
    return { sync: TestBed.inject(Sync), upsert, from };
  }

  afterEach(() => db.delete());

  const local = (changes: Partial<LocalEntry> = {}): LocalEntry => ({
    ...blankEntry('free'),
    dirty: 1,
    ...changes,
  });

  it('uploads dirty entries as rows and marks them clean', async () => {
    const { sync, upsert, from } = setup();
    await db.entries.bulkAdd([local({ id: 'a', body: 'Hi' }), local({ id: 'b', dirty: 0 })]);

    await sync.push();

    expect(from).toHaveBeenCalledWith('entries');
    const [rows] = upsert.mock.calls[0];
    expect(rows.map((row: { id: string }) => row.id)).toEqual(['a']);
    expect(rows[0]).toMatchObject({ body: 'Hi' });
    expect((await db.entries.get('a'))?.dirty).toBe(0);
    expect(sync.state()).toBe('saved');
  });

  it('keeps an entry dirty if it was edited during the upload', async () => {
    const { sync, upsert } = setup();
    await db.entries.add(local({ id: 'a', clientUpdatedAt: '2026-10-21T21:00:00.000Z' }));
    upsert.mockImplementation(async () => {
      // You keep typing while the request is in flight.
      await db.entries.update('a', { clientUpdatedAt: '2026-10-21T21:00:05.000Z' });
      return ok;
    });

    await sync.push();

    expect((await db.entries.get('a'))?.dirty).toBe(1);
  });

  it('does nothing when there is nothing to push, or nobody is signed in', async () => {
    const signedIn = setup();
    await signedIn.sync.push();
    expect(signedIn.upsert).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    await db.delete();
    const signedOut = setup(false);
    await db.entries.add(local());
    await signedOut.sync.push();
    expect(signedOut.upsert).not.toHaveBeenCalled();
  });

  it('reports offline when the server can’t be reached, and keeps entries dirty', async () => {
    const { sync, upsert } = setup();
    await db.entries.add(local({ id: 'a' }));
    upsert.mockResolvedValue({ status: 0, error: { message: 'TypeError: Failed to fetch' } });

    await expect(sync.push()).rejects.toBeInstanceOf(OfflineError);
    expect(sync.state()).toBe('offline');
    expect((await db.entries.get('a'))?.dirty).toBe(1);
  });

  it('reports an error when the server refuses', async () => {
    const { sync, upsert } = setup();
    await db.entries.add(local());
    upsert.mockResolvedValue({ status: 400, error: { message: 'violates check constraint' } });

    await expect(sync.push()).rejects.toThrow('violates check constraint');
    expect(sync.state()).toBe('error');
  });

  it('uploads a big journal in batches of 500', async () => {
    const { sync, upsert } = setup();
    await db.entries.bulkAdd(Array.from({ length: 1001 }, () => local()));

    await sync.push();

    expect(upsert.mock.calls.map(([rows]) => rows.length)).toEqual([500, 500, 1]);
    expect(await db.entries.where('dirty').equals(1).count()).toBe(0);
  });
});

describe('Sync.pull', () => {
  let db: LocalDb;

  /** A server row, last stamped `updatedAt` by Supabase. */
  const row = (id: string, updatedAt: string, changes: Partial<EntryRow> = {}): EntryRow => ({
    ...toRow({ ...blankEntry('free'), id, clientUpdatedAt: updatedAt }),
    updated_at: updatedAt,
    ...changes,
  });

  /**
   * A fake `entries` table that answers select().gt().order().order().range()
   * like Supabase: filtered, sorted, then sliced to the requested page.
   */
  function setup(serverRows: EntryRow[], { offline = false } = {}) {
    const requests: { since: string | null; from: number; to: number }[] = [];
    const select = () => {
      let since: string | null = null;
      const query = {
        gt: (_column: string, value: string) => ((since = value), query),
        order: () => query,
        range: async (from: number, to: number) => {
          requests.push({ since, from, to });
          if (offline) return { status: 0, error: { message: 'Failed to fetch' }, data: null };
          const data = serverRows
            .filter((r) => !since || r.updated_at > since)
            .sort((a, b) => a.updated_at.localeCompare(b.updated_at) || a.id.localeCompare(b.id))
            .slice(from, to + 1);
          return { status: 200, error: null, data };
        },
      };
      return query;
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE, useValue: { db: { from: () => ({ select }) } } },
        { provide: Auth, useValue: { session: signal({} as Session) } },
      ],
    });
    db = TestBed.inject(LocalDb);
    return { sync: TestBed.inject(Sync), requests };
  }

  afterEach(() => db.delete());

  const cursor = async () => (await db.meta.get('lastPulledAt'))?.value;

  it('downloads everything the first time and remembers where it got to', async () => {
    const { sync, requests } = setup([
      row('a', '2026-10-20T10:00:00.000Z', { title: 'First' }),
      row('b', '2026-10-21T10:00:00.000Z'),
    ]);

    await sync.pull();

    expect(requests).toEqual([{ since: null, from: 0, to: 999 }]);
    expect(await db.entries.get('a')).toMatchObject({ title: 'First', dirty: 0 });
    expect(await cursor()).toBe('2026-10-21T10:00:00.000Z');
  });

  it('pages through more than 1,000 rows until a page comes back short', async () => {
    const rows = Array.from({ length: 2345 }, (_, i) =>
      row(
        `id-${String(i).padStart(4, '0')}`,
        new Date(Date.UTC(2026, 9, 1) + i * 1000).toISOString(),
      ),
    );
    const { sync, requests } = setup(rows);

    await sync.pull();

    expect(requests.map((r) => r.from)).toEqual([0, 1000, 2000]);
    expect(await db.entries.count()).toBe(2345);
    expect(await cursor()).toBe(rows[2344].updated_at);
  });

  it('asks only for changes since the last pull, minus a minute', async () => {
    const { sync, requests } = setup([row('a', '2026-10-21T10:00:30.000Z')]);
    await db.meta.put({ key: 'lastPulledAt', value: '2026-10-21T10:00:00.000Z' });

    await sync.pull();

    expect(requests[0].since).toBe('2026-10-21T09:59:00.000Z');
    expect(await cursor()).toBe('2026-10-21T10:00:30.000Z');
  });

  it('keeps newer unpushed local edits and takes everything else', async () => {
    const { sync } = setup([
      row('mine', '2026-10-21T10:00:00.000Z', { title: 'Server' }),
      row('theirs', '2026-10-21T10:00:00.000Z', { title: 'Server' }),
    ]);
    await db.entries.bulkAdd([
      {
        ...blankEntry('free'),
        id: 'mine',
        title: 'Mine',
        dirty: 1,
        clientUpdatedAt: '2026-10-21T11:00:00.000Z',
      },
      {
        ...blankEntry('free'),
        id: 'theirs',
        title: 'Old',
        dirty: 1,
        clientUpdatedAt: '2026-10-21T09:00:00.000Z',
      },
    ]);

    await sync.pull();

    expect(await db.entries.get('mine')).toMatchObject({ title: 'Mine', dirty: 1 });
    expect(await db.entries.get('theirs')).toMatchObject({ title: 'Server', dirty: 0 });
  });

  it('brings deletions from other devices down as tombstones', async () => {
    const { sync } = setup([
      row('a', '2026-10-21T10:00:00.000Z', { deleted_at: '2026-10-21T10:00:00.000Z' }),
    ]);
    await db.entries.add({ ...blankEntry('free'), id: 'a', title: 'Gone soon', dirty: 0 });

    await sync.pull();

    expect((await db.entries.get('a'))?.deletedAt).toBe('2026-10-21T10:00:00.000Z');
  });

  it('leaves the cursor alone when a page fails', async () => {
    const { sync } = setup([row('a', '2026-10-21T10:00:00.000Z')], { offline: true });

    await expect(sync.pull()).rejects.toBeInstanceOf(OfflineError);
    expect(await cursor()).toBeUndefined();
  });
});

describe('Sync profile', () => {
  let db: LocalDb;
  const session = { user: { id: 'user-1' } } as Session;

  /** A fake `profiles` table: update().eq() and select().eq().maybeSingle(). */
  function setup(serverRow: object | null = null) {
    const update = vi.fn();
    const table = {
      update: (values: object) => ({
        eq: async (column: string, id: string) => (
          update(values, column, id),
          { status: 204, error: null }
        ),
      }),
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ status: 200, error: null, data: serverRow }) }),
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE, useValue: { db: { from: () => table } } },
        { provide: Auth, useValue: { session: signal(session) } },
      ],
    });
    db = TestBed.inject(LocalDb);
    return { sync: TestBed.inject(Sync), update };
  }

  afterEach(() => db.delete());

  const profile = { displayName: 'K', language: 'es', hidePreviews: true } as const;

  it('uploads changed settings to your row, then clears the flag', async () => {
    const { sync, update } = setup();
    await db.meta.bulkPut([
      { key: 'profile', value: profile },
      { key: 'profileDirty', value: true },
    ]);

    await sync.pushProfile();

    expect(update).toHaveBeenCalledWith(
      { display_name: 'K', language: 'es', hide_previews: true },
      'id',
      'user-1',
    );
    expect(await db.meta.get('profileDirty')).toBeUndefined();
  });

  it('skips the upload when nothing changed here', async () => {
    const { sync, update } = setup();
    await db.meta.put({ key: 'profile', value: profile });
    await sync.pushProfile();
    expect(update).not.toHaveBeenCalled();
  });

  it('downloads your settings into the local cache', async () => {
    const { sync } = setup({ display_name: 'K', language: 'es', hide_previews: true });
    await sync.pullProfile();
    expect((await db.meta.get('profile'))?.value).toEqual(profile);
  });

  it('keeps settings changed here that haven’t gone up yet', async () => {
    const { sync } = setup({ display_name: 'Old', language: 'en', hide_previews: false });
    await db.meta.bulkPut([
      { key: 'profile', value: profile },
      { key: 'profileDirty', value: true },
    ]);

    await sync.pullProfile();

    expect((await db.meta.get('profile'))?.value).toEqual(profile);
  });
});

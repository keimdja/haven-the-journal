import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Session } from '@supabase/auth-js';

import { Auth } from '../auth/auth';
import { SUPABASE } from '../auth/supabase';
import { blankEntry } from './entries-repo';
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

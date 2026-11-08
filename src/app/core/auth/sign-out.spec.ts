import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../data/entries-repo';
import { LocalDb } from '../data/local-db';
import { Sync } from '../data/sync';
import { Auth } from './auth';
import { SignOutFlow } from './sign-out';

describe('SignOutFlow', () => {
  let db: LocalDb;

  function setup() {
    const sync = {
      run: vi.fn().mockResolvedValue(undefined),
      cancelPending: vi.fn(),
      requestSoon: vi.fn(),
    };
    const auth = { signOut: vi.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Sync, useValue: sync },
        { provide: Auth, useValue: auth },
      ],
    });
    db = TestBed.inject(LocalDb);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    return { flow: TestBed.inject(SignOutFlow), sync, auth, router };
  }

  afterEach(async () => {
    vi.restoreAllMocks();
    await db.delete();
  });

  it('syncs first and reports nothing left when all went up', async () => {
    const { flow, sync } = setup();
    await db.entries.add({ ...blankEntry('free'), dirty: 0 });

    expect(await flow.hasUnsyncedChanges()).toBe(false);
    expect(sync.run).toHaveBeenCalled();
  });

  it('reports entries that couldn’t go up', async () => {
    const { flow } = setup();
    await db.entries.add({ ...blankEntry('free'), dirty: 1 });
    expect(await flow.hasUnsyncedChanges()).toBe(true);
  });

  it('reports settings that couldn’t go up', async () => {
    const { flow } = setup();
    await db.meta.put({ key: 'profileDirty', value: true });
    expect(await flow.hasUnsyncedChanges()).toBe(true);
  });

  it('erases this device’s copy, then ends the session and goes to login', async () => {
    const { flow, sync, auth, router } = setup();
    await db.entries.add({ ...blankEntry('free'), dirty: 0 });
    await db.meta.put({ key: 'profile', value: { displayName: 'K' } });
    await db.meta.put({ key: 'lastPulledAt', value: '2026-10-21T00:00:00.000Z' });

    // Whatever else happens, the data must be gone by the time the session ends.
    let entriesAtSignOut = -1;
    auth.signOut.mockImplementation(async () => {
      entriesAtSignOut = await db.entries.count();
    });

    await flow.finish();

    expect(sync.cancelPending).toHaveBeenCalled();
    expect(entriesAtSignOut).toBe(0);
    expect(await db.meta.count()).toBe(0);
    expect(db.isOpen()).toBe(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('leaves the live lists working for whoever signs in next', async () => {
    const { flow } = setup();
    const repo = TestBed.inject(EntriesRepo);
    await repo.create('free');
    await vi.waitFor(() => expect(repo.all()).toHaveLength(1));

    await flow.finish();
    await vi.waitFor(() => expect(repo.all()).toHaveLength(0));

    await repo.create('reflection');
    await vi.waitFor(() => expect(repo.all()).toHaveLength(1));
    expect(repo.all()[0].kind).toBe('reflection');
  });
});

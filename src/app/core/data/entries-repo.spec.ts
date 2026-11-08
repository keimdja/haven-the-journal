import { TestBed } from '@angular/core/testing';

import { EntriesRepo, blankEntry } from './entries-repo';
import { LocalDb } from './local-db';
import { Sync } from './sync';

/** The lists update from IndexedDB a moment after a write; wait for them. */
async function until(condition: () => boolean): Promise<void> {
  for (let i = 0; i < 100 && !condition(); i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  expect(condition()).toBe(true);
}

describe('EntriesRepo', () => {
  let repo: EntriesRepo;
  let db: LocalDb;
  let sync: { requestSoon: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sync = { requestSoon: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: Sync, useValue: sync }] });
    repo = TestBed.inject(EntriesRepo);
    db = TestBed.inject(LocalDb);
  });
  afterEach(() => db.delete());

  it('starts free writing complete and reflections as a draft at part 1', () => {
    const now = new Date('2026-10-21T21:12:00.000Z');
    expect(blankEntry('free', now)).toMatchObject({
      kind: 'free',
      status: 'complete',
      currentStep: null,
      writtenAt: '2026-10-21T21:12:00.000Z',
    });
    expect(blankEntry('reflection', now)).toMatchObject({ status: 'draft', currentStep: 1 });
    expect(blankEntry('free').id).not.toBe(blankEntry('free').id);
  });

  it('creates an entry, stores it for sync, and finds it by id', async () => {
    const created = await repo.create('free');

    expect(await repo.byId(created.id)).toEqual(created);
    expect((await db.entries.get(created.id))?.dirty).toBe(1);
  });

  it('asks sync to push after every change', async () => {
    const created = await repo.create('free');
    await repo.save({ ...created, body: 'Hi' });
    await repo.remove(created.id);
    expect(sync.requestSoon).toHaveBeenCalledTimes(3);
  });

  it('saves a new version with a new edit time', async () => {
    const created = await repo.create('free');
    await db.entries.update(created.id, { dirty: 0 }); // as if it had synced
    await new Promise((resolve) => setTimeout(resolve, 2));

    const saved = await repo.save({ ...created, body: 'A quiet Wednesday.' });

    expect(saved.clientUpdatedAt > created.clientUpdatedAt).toBe(true);
    expect((await repo.byId(created.id))?.body).toBe('A quiet Wednesday.');
    expect((await db.entries.get(created.id))?.dirty).toBe(1);
  });

  it('deletes by emptying the entry into a tombstone', async () => {
    const created = await repo.create('reflection');
    await repo.save({ ...created, title: 'The meeting', thoughts: 'Words', feelings: ['anxious'] });

    await repo.remove(created.id);

    expect(await repo.byId(created.id)).toBeUndefined();
    const tombstone = await db.entries.get(created.id);
    expect(tombstone).toMatchObject({ title: null, thoughts: null, feelings: [], dirty: 1 });
    expect(tombstone?.deletedAt).toBeTruthy();
  });

  it('keeps the lists current: newest first, the latest three, and the newest draft', async () => {
    const days = ['2026-10-15', '2026-10-17', '2026-10-18', '2026-10-20'];
    for (const day of days) {
      const entry = await repo.create(day === '2026-10-17' ? 'reflection' : 'free');
      await repo.save({ ...entry, writtenAt: `${day}T12:00:00.000Z`, title: day });
    }
    // Wait for the last save too, not just the fourth row to appear.
    await until(() => repo.all().length === 4 && repo.all().every((entry) => entry.title));

    expect(repo.all().map((entry) => entry.title)).toEqual([
      '2026-10-20',
      '2026-10-18',
      '2026-10-17',
      '2026-10-15',
    ]);
    expect(repo.recent()).toHaveLength(3);
    expect(repo.newestDraft()?.title).toBe('2026-10-17');
    expect('dirty' in repo.all()[0]).toBe(false);

    await repo.remove(repo.all()[0].id);
    await until(() => repo.all().length === 3);
    expect(repo.recent()[0].title).toBe('2026-10-18');
  });
});

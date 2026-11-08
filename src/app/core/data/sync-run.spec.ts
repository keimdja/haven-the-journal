import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Session } from '@supabase/auth-js';

import { Auth } from '../auth/auth';
import { SUPABASE } from '../auth/supabase';
import { LocalDb } from './local-db';
import { OfflineError, SYNC_DELAY_MS, Sync } from './sync';

describe('Sync.run', () => {
  let db: LocalDb;

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE, useValue: {} },
        { provide: Auth, useValue: { session: signal({} as Session) } },
      ],
    });
    db = TestBed.inject(LocalDb);
    const sync = TestBed.inject(Sync);
    const calls: string[] = [];
    const push = vi.spyOn(sync, 'push').mockImplementation(async () => void calls.push('push'));
    const pull = vi.spyOn(sync, 'pull').mockImplementation(async () => void calls.push('pull'));
    vi.spyOn(sync, 'pushProfile').mockImplementation(async () => void calls.push('pushProfile'));
    vi.spyOn(sync, 'pullProfile').mockImplementation(async () => void calls.push('pullProfile'));
    return { sync, calls, push, pull };
  }

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await db.delete();
  });

  it('pushes, then pulls, entries then profile, then says saved', async () => {
    const { sync, calls } = setup();
    await sync.run();
    expect(calls).toEqual(['push', 'pushProfile', 'pull', 'pullProfile']);
    expect(sync.state()).toBe('saved');
  });

  it('runs one at a time, with one more run queued for changes made meanwhile', async () => {
    const { sync, push } = setup();
    let finish!: () => void;
    push.mockImplementationOnce(() => new Promise<void>((resolve) => (finish = resolve)));

    const first = sync.run();
    void sync.run();
    void sync.run(); // several asks while busy still mean one more run
    finish();
    await first;
    await vi.waitFor(() => expect(push).toHaveBeenCalledTimes(2));
  });

  it('shows offline when the server can’t be reached, without throwing', async () => {
    const { sync, pull } = setup();
    pull.mockRejectedValue(new OfflineError('Failed to fetch'));
    await expect(sync.run()).resolves.toBeUndefined();
    expect(sync.state()).toBe('offline');
  });

  it('shows offline straight away when the device knows it is offline', async () => {
    const { sync, push } = setup();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    await sync.run();
    expect(push).not.toHaveBeenCalled();
    expect(sync.state()).toBe('offline');
  });

  it('shows an error for anything else', async () => {
    const { sync, push } = setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    push.mockRejectedValue(new Error('violates check constraint'));
    await sync.run();
    expect(sync.state()).toBe('error');
  });

  it('after a save, says saving and syncs once typing pauses', async () => {
    vi.useFakeTimers();
    const { sync, push } = setup();

    sync.requestSoon();
    vi.advanceTimersByTime(SYNC_DELAY_MS - 1);
    sync.requestSoon(); // another keystroke restarts the wait
    expect(sync.state()).toBe('saving');
    vi.advanceTimersByTime(SYNC_DELAY_MS - 1);
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(push).toHaveBeenCalledTimes(1);
  });
});

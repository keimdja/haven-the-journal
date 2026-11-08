import { ApplicationInitStatus, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { User } from '@supabase/auth-js';

import { Auth } from '../auth/auth';
import { Sync } from './sync';
import { provideSyncTriggers } from './sync-triggers';

describe('provideSyncTriggers', () => {
  async function setup(signedIn: boolean) {
    const user = signal<Pick<User, 'id'> | null>(signedIn ? { id: 'user-1' } : null);
    const sync = { run: vi.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({
      providers: [
        provideSyncTriggers(),
        { provide: Sync, useValue: sync },
        { provide: Auth, useValue: { user } },
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    TestBed.tick();
    return { sync, user };
  }

  it('syncs when the app opens signed in', async () => {
    const { sync } = await setup(true);
    await vi.waitFor(() => expect(sync.run).toHaveBeenCalledTimes(1));
  });

  it('syncs right after you sign in, not while signed out', async () => {
    const { sync, user } = await setup(false);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sync.run).not.toHaveBeenCalled();

    user.set({ id: 'user-1' });
    TestBed.tick();
    await vi.waitFor(() => expect(sync.run).toHaveBeenCalledTimes(1));
  });

  it('syncs when the device comes back online', async () => {
    const { sync } = await setup(true);
    window.dispatchEvent(new Event('online'));
    await vi.waitFor(() => expect(sync.run).toHaveBeenCalledTimes(2));
  });

  it('syncs when you come back to the tab', async () => {
    const { sync } = await setup(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(sync.run).toHaveBeenCalledTimes(2));
    vi.restoreAllMocks();
  });
});

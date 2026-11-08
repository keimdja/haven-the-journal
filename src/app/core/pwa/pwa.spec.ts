import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';

import { Auth } from '../auth/auth';
import { Pwa } from './pwa';

describe('Pwa', () => {
  function setup(isEnabled = true, user = signal<object | null>(null)) {
    const versionUpdates = new Subject<VersionEvent>();
    const unrecoverable = new Subject<unknown>();
    const checkForUpdate = vi.fn().mockResolvedValue(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: { user } },
        {
          provide: SwUpdate,
          useValue: { isEnabled, versionUpdates, unrecoverable, checkForUpdate },
        },
      ],
    });
    const pwa = TestBed.inject(Pwa);
    const reload = vi.spyOn(pwa, 'reload').mockImplementation(() => {});
    return { pwa, versionUpdates, unrecoverable, checkForUpdate, reload, user };
  }

  afterEach(() => vi.restoreAllMocks());

  it('offers the update once a new version is ready', () => {
    const { pwa, versionUpdates } = setup();
    expect(pwa.updateReady()).toBe(false);

    versionUpdates.next({ type: 'VERSION_DETECTED' } as VersionEvent);
    expect(pwa.updateReady()).toBe(false);

    versionUpdates.next({ type: 'VERSION_READY' } as VersionEvent);
    expect(pwa.updateReady()).toBe(true);
  });

  it('reloads if the cached version can no longer run', () => {
    const { unrecoverable, reload } = setup();
    unrecoverable.next({});
    expect(reload).toHaveBeenCalled();
  });

  it('checks for updates when you come back to the app', () => {
    const { checkForUpdate } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('doesn’t check while hidden', () => {
    const { checkForUpdate } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(checkForUpdate).not.toHaveBeenCalled();
  });

  it('survives a failed check, as when offline', async () => {
    const { checkForUpdate } = setup();
    checkForUpdate.mockRejectedValue(new Error('offline'));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    // If the failure weren't handled, the test run would report an unhandled rejection.
    await new Promise((resolve) => setTimeout(resolve));
    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the service worker is off', () => {
    const { pwa, versionUpdates, checkForUpdate } = setup(false);
    versionUpdates.next({ type: 'VERSION_READY' } as VersionEvent);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(pwa.updateReady()).toBe(false);
    expect(checkForUpdate).not.toHaveBeenCalled();
  });

  describe('persistent storage', () => {
    function stubStorage(alreadyPersisted = false) {
      const storage = {
        persisted: vi.fn().mockResolvedValue(alreadyPersisted),
        persist: vi.fn().mockResolvedValue(true),
      };
      Object.defineProperty(navigator, 'storage', { configurable: true, value: storage });
      return storage;
    }
    const flush = async () => {
      TestBed.tick();
      await new Promise((resolve) => setTimeout(resolve));
    };

    afterEach(() => {
      delete (navigator as unknown as Record<string, unknown>)['storage'];
    });

    it('waits until you’re signed in, then asks', async () => {
      const storage = stubStorage();
      const { user } = setup();
      await flush();
      expect(storage.persist).not.toHaveBeenCalled();

      user.set({ id: 'u1' });
      await flush();
      expect(storage.persist).toHaveBeenCalledTimes(1);
    });

    it('asks only once, even if the session changes', async () => {
      const storage = stubStorage();
      const { user } = setup(true, signal<object | null>({ id: 'u1' }));
      await flush();
      user.set({ id: 'u1', refreshed: true });
      await flush();
      expect(storage.persist).toHaveBeenCalledTimes(1);
    });

    it('doesn’t ask if storage is already kept', async () => {
      const storage = stubStorage(true);
      setup(true, signal<object | null>({ id: 'u1' }));
      await flush();
      expect(storage.persist).not.toHaveBeenCalled();
    });

    it('works where the browser has no storage API', async () => {
      setup(true, signal<object | null>({ id: 'u1' }));
      await expect(flush()).resolves.toBeUndefined();
    });

    it('still asks when update checks are off', async () => {
      const storage = stubStorage();
      setup(false, signal<object | null>({ id: 'u1' }));
      await flush();
      expect(storage.persist).toHaveBeenCalledTimes(1);
    });
  });
});

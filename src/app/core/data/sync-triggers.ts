import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  EnvironmentInjector,
  EnvironmentProviders,
  effect,
  inject,
  provideAppInitializer,
} from '@angular/core';

import { Auth } from '../auth/auth';

/**
 * Runs sync on its own whenever it's likely to matter:
 *
 * - when the app opens signed in, and right after you sign in (the session appears);
 * - when the device comes back online;
 * - when you return to the tab or app (it may have changed on another device).
 *
 * Saving an entry asks for a run too, through `Sync.requestSoon()`.
 *
 * Sync, the profile store and the local database under them are loaded on
 * first use rather than with the app, so they don't add to the first download.
 */
export function provideSyncTriggers(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const injector = inject(EnvironmentInjector);
    const auth = inject(Auth);
    const document = inject(DOCUMENT);
    const window = document.defaultView;

    // The profile store starts with sync, so a language chosen on another device
    // is applied here as soon as it's pulled.
    const run = () =>
      void Promise.all([import('./sync'), import('./profile-store')]).then(
        ([{ Sync }, { ProfileStore }]) => {
          injector.get(ProfileStore);
          return injector.get(Sync).run();
        },
      );

    let userId: string | undefined;
    effect(() => {
      const id = auth.user()?.id;
      if (id && id !== userId) run();
      userId = id;
    });

    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    window?.addEventListener('online', run);
    document.addEventListener('visibilitychange', onVisible);
    inject(DestroyRef).onDestroy(() => {
      window?.removeEventListener('online', run);
      document.removeEventListener('visibilitychange', onVisible);
    });
  });
}

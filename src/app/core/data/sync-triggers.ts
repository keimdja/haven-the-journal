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
 * Sync (and the local database under it) is loaded on first use rather than
 * with the app, so it doesn't add to the first download.
 */
export function provideSyncTriggers(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const injector = inject(EnvironmentInjector);
    const auth = inject(Auth);
    const document = inject(DOCUMENT);
    const window = document.defaultView;

    const run = () => void import('./sync').then(({ Sync }) => injector.get(Sync).run());

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

import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

import { Auth } from '../auth/auth';

/**
 * Keeps the installed app current. A new version downloads quietly in the
 * background; `updateReady` then turns true so a line can offer to reload. It
 * looks for updates whenever you come back to the app. If the cached version
 * can no longer run, it reloads straight away. Update checks are off in development.
 *
 * Once you've signed in it also asks the browser to keep this site's storage,
 * so your journal's on-device copy isn't cleared when space runs low.
 */
@Injectable({ providedIn: 'root' })
export class Pwa {
  private readonly updates = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);
  private readonly auth = inject(Auth);

  private readonly ready = signal(false);
  readonly updateReady = this.ready.asReadonly();

  private storageRequested = false;

  constructor() {
    effect(() => {
      if (this.auth.user()) untracked(() => void this.keepStorage());
    });

    if (!this.updates.isEnabled) return;
    const destroyRef = inject(DestroyRef);

    this.updates.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => this.ready.set(true));

    this.updates.unrecoverable.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.reload());

    const onVisible = () => {
      // A failed check (offline, say) just means trying again next time.
      if (this.document.visibilityState === 'visible')
        void this.updates.checkForUpdate().catch(() => {});
    };
    this.document.addEventListener('visibilitychange', onVisible);
    destroyRef.onDestroy(() => this.document.removeEventListener('visibilitychange', onVisible));
  }

  /** Asks once per visit. The browser may say no; the app works the same either way. */
  private async keepStorage(): Promise<void> {
    if (this.storageRequested) return;
    this.storageRequested = true;
    const storage = this.document.defaultView?.navigator.storage;
    if (!storage?.persist || (await storage.persisted())) return;
    await storage.persist();
  }

  reload(): void {
    this.document.location.reload();
  }
}

import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Keeps the installed app current. A new version downloads quietly in the
 * background; `updateReady` then turns true so a line can offer to reload. It
 * looks for updates whenever you come back to the app. If the cached version
 * can no longer run, it reloads straight away. Off in development.
 */
@Injectable({ providedIn: 'root' })
export class Pwa {
  private readonly updates = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);

  private readonly ready = signal(false);
  readonly updateReady = this.ready.asReadonly();

  constructor() {
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

  reload(): void {
    this.document.location.reload();
  }
}

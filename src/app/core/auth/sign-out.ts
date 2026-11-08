import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LocalDb } from '../data/local-db';
import { Sync } from '../data/sync';
import { Auth } from './auth';

/**
 * Signing out without losing anything or leaving anything behind. Signing out
 * erases the journal from this device, so that the next person to sign in here
 * can't see it; your account keeps everything that has synced.
 *
 * 1. `hasUnsyncedChanges()` syncs one last time and reports what couldn't go up,
 *    so the screen can warn before anything is lost.
 * 2. `finish()` erases this device's copy, then ends the session.
 */
@Injectable({ providedIn: 'root' })
export class SignOutFlow {
  private readonly auth = inject(Auth);
  private readonly db = inject(LocalDb);
  private readonly sync = inject(Sync);
  private readonly router = inject(Router);

  async hasUnsyncedChanges(): Promise<boolean> {
    await this.sync.run();
    const [entries, profile] = await Promise.all([
      this.db.entries.where('dirty').equals(1).count(),
      this.db.meta.get('profileDirty'),
    ]);
    return entries > 0 || !!profile?.value;
  }

  /** Data goes first: if anything fails after this, nothing private is left on the device. */
  async finish(): Promise<void> {
    this.sync.cancelPending();
    await this.db.delete();
    await this.db.open();
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}

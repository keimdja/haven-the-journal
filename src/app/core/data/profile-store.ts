import { Injectable, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

import { I18n, Lang } from '../i18n/i18n';
import { LocalDb } from './local-db';
import type { Profile } from './models';
import { Sync } from './sync';

/**
 * Your settings (name, language, Hide previews), kept on this device in the
 * `meta` table and synced with your `profiles` row. Change them with `update()`.
 *
 * The language follows the profile: choose Español on one device and the
 * others switch after their next sync.
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly db = inject(LocalDb);
  private readonly sync = inject(Sync);
  private readonly i18n = inject(I18n);

  /** Null until the profile has been pulled (or changed) on this device. */
  readonly profile = toSignal(
    from(liveQuery(async () => ((await this.db.meta.get('profile'))?.value as Profile) ?? null)),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      const language = this.profile()?.language;
      // Untracked: this follows the profile arriving, and mustn't undo a choice just made here.
      if (language && language !== untracked(this.i18n.lang)) this.i18n.setLang(language);
    });
  }

  /** Switches the app straight away and remembers the choice for your other devices. */
  setLanguage(language: Lang): Promise<void> {
    this.i18n.setLang(language);
    return this.update({ language });
  }

  /** Saves a change here, marks it for upload, and asks sync to push it soon. */
  async update(changes: Partial<Profile>): Promise<void> {
    await this.db.transaction('rw', this.db.meta, async () => {
      const current = (await this.db.meta.get('profile'))?.value as Profile | undefined;
      const next: Profile = {
        displayName: '',
        language: this.i18n.lang(),
        hidePreviews: false,
        ...current,
        ...changes,
      };
      await this.db.meta.bulkPut([
        { key: 'profile', value: next },
        { key: 'profileDirty', value: true },
      ]);
    });
    this.sync.requestSoon();
  }
}

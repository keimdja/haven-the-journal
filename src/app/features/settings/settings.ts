import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';

import { Auth } from '../../core/auth/auth';
import { ProfileStore } from '../../core/data/profile-store';
import { I18n, Lang } from '../../core/i18n/i18n';
import { SectionLabel } from '../../shared/ui/section-label/section-label';
import {
  SegmentOption,
  SegmentedControl,
} from '../../shared/ui/segmented-control/segmented-control';
import { SettingsRow } from '../../shared/ui/settings-row/settings-row';
import { SignOutRow } from './sign-out-row/sign-out-row';

/** How long typing a name has to pause before it's saved. */
export const NAME_SAVE_MS = 500;

/** Each language in its own words, so you can find yours whichever is showing. */
const LANGUAGES: readonly SegmentOption<Lang>[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

/** Language, account, privacy and your journal. */
@Component({
  selector: 'app-settings',
  imports: [SectionLabel, SegmentedControl, SettingsRow, SignOutRow],
  templateUrl: './settings.html',
  host: { class: 'mx-auto block w-full max-w-2xl' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly i18n = inject(I18n);
  private readonly auth = inject(Auth);
  private readonly store = inject(ProfileStore);

  protected readonly t = this.i18n.t;
  protected readonly lang = this.i18n.lang;
  protected readonly languages = LANGUAGES;
  protected readonly email = computed(() => this.auth.user()?.email ?? '');
  protected readonly name = computed(() => this.store.profile()?.displayName ?? '');

  private nameTimer: ReturnType<typeof setTimeout> | undefined;
  private pendingName: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.saveName());
  }

  protected setLanguage(language: Lang): void {
    void this.store.setLanguage(language);
  }

  protected editName(value: string): void {
    this.pendingName = value;
    clearTimeout(this.nameTimer);
    this.nameTimer = setTimeout(() => this.saveName(), NAME_SAVE_MS);
  }

  private saveName(): void {
    clearTimeout(this.nameTimer);
    if (this.pendingName === null) return;
    void this.store.update({ displayName: this.pendingName.trim() });
    this.pendingName = null;
  }
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ProfileStore } from '../../core/data/profile-store';
import { formatLongDate } from '../../core/i18n/format-date';
import { greeting } from '../../core/i18n/greeting';
import { I18n } from '../../core/i18n/i18n';
import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { StartOptions } from './start-options/start-options';

/** Where you land: today's date, a greeting, and the ways to begin. */
@Component({
  selector: 'app-home',
  imports: [BrandMark, StartOptions],
  templateUrl: './home.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly i18n = inject(I18n);
  private readonly profile = inject(ProfileStore).profile;
  private readonly now = new Date();

  protected readonly t = this.i18n.t;
  protected readonly date = computed(() => formatLongDate(this.now, this.i18n.locale()));
  protected readonly hello = computed(() =>
    greeting(this.now, this.t(), this.profile()?.displayName),
  );
}

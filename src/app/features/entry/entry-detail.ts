import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { EntriesRepo } from '../../core/data/entries-repo';
import { formatLongDate, formatTime } from '../../core/i18n/format-date';
import { I18n } from '../../core/i18n/i18n';
import { Icon } from '../../shared/ui/icon/icon';
import { KindTag } from '../../shared/ui/kind-tag/kind-tag';
import { DeleteEntry } from './delete-entry/delete-entry';
import { FreeBody } from './free-body/free-body';
import { ReflectionBody } from './reflection-body/reflection-body';

/** One entry, read back. It follows the list, so a sync from elsewhere shows up here too. */
@Component({
  selector: 'app-entry-detail',
  imports: [DeleteEntry, FreeBody, Icon, KindTag, ReflectionBody, RouterLink],
  templateUrl: './entry-detail.html',
  host: { class: 'mx-auto block w-full max-w-2xl pb-12' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryDetail {
  private readonly repo = inject(EntriesRepo);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  /** From the URL. */
  readonly id = input.required<string>();

  protected readonly entry = computed(() =>
    this.repo.all().find((entry) => entry.id === this.id()),
  );

  protected readonly when = computed(() => {
    const entry = this.entry();
    if (!entry) return '';
    const written = new Date(entry.writtenAt);
    const locale = this.i18n.locale();
    return `${formatLongDate(written, locale, true)} · ${formatTime(written, locale)}`;
  });

  protected readonly editLink = computed(() => {
    const entry = this.entry();
    if (!entry) return [];
    return entry.kind === 'free' ? ['/write', entry.id] : ['/reflect', entry.id, 'review'];
  });

  constructor() {
    // A mistyped address, or an entry deleted on another device.
    effect(() => {
      if (this.repo.loaded() && !this.entry()) {
        void this.router.navigateByUrl('/journal', { replaceUrl: true });
      }
    });
  }
}

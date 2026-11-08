import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { EntriesRepo } from '../../core/data/entries-repo';
import { I18n } from '../../core/i18n/i18n';
import { MonthGroup } from './month-group/month-group';
import { groupByMonth } from './month-groups';

/** Every entry, newest first, grouped by month. */
@Component({
  selector: 'app-journal',
  imports: [MonthGroup],
  templateUrl: './journal.html',
  host: { class: 'mx-auto block w-full max-w-3xl' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Journal {
  private readonly repo = inject(EntriesRepo);
  private readonly i18n = inject(I18n);

  protected readonly t = this.i18n.t;
  protected readonly loaded = this.repo.loaded;
  protected readonly groups = computed(() => groupByMonth(this.repo.all(), this.i18n.locale()));
}

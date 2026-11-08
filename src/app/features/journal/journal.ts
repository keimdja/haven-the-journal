import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { EntriesRepo } from '../../core/data/entries-repo';
import { I18n } from '../../core/i18n/i18n';
import { KIND_FILTERS, KindFilter, KindFilterValue } from './kind-filter/kind-filter';
import { MonthGroup } from './month-group/month-group';
import { groupByMonth } from './month-groups';

/** Every entry, newest first, grouped by month. */
@Component({
  selector: 'app-journal',
  imports: [KindFilter, MonthGroup],
  templateUrl: './journal.html',
  host: { class: 'mx-auto block w-full max-w-3xl' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Journal {
  private readonly repo = inject(EntriesRepo);
  private readonly i18n = inject(I18n);
  private readonly router = inject(Router);

  /** From the URL (`?kind=`), so going Back to the list restores the filter. */
  readonly kind = input<string>();

  protected readonly t = this.i18n.t;
  protected readonly loaded = this.repo.loaded;

  protected readonly filter = computed<KindFilterValue>(() => {
    const kind = this.kind() as KindFilterValue | undefined;
    return kind && KIND_FILTERS.includes(kind) ? kind : 'all';
  });

  private readonly visible = computed(() => {
    const filter = this.filter();
    const entries = this.repo.all();
    return filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter);
  });

  protected readonly groups = computed(() => groupByMonth(this.visible(), this.i18n.locale()));

  protected setFilter(filter: KindFilterValue): void {
    void this.router.navigate([], {
      queryParams: { kind: filter === 'all' ? null : filter },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

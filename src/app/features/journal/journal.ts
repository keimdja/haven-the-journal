import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { EntriesRepo } from '../../core/data/entries-repo';
import { searchEntries } from '../../core/data/search';
import { I18n } from '../../core/i18n/i18n';
import { TextField, TextFieldInput } from '../../shared/ui/text-field/text-field';
import { KIND_FILTERS, KindFilter, KindFilterValue } from './kind-filter/kind-filter';
import { MonthGroup } from './month-group/month-group';
import { groupByMonth } from './month-groups';

/** How long typing in the search box has to pause before the list changes. */
export const SEARCH_DEBOUNCE_MS = 200;

/** Every entry, newest first, grouped by month, with a kind filter and search. */
@Component({
  selector: 'app-journal',
  imports: [KindFilter, MonthGroup, TextField, TextFieldInput],
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

  private readonly query = signal('');
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly visible = computed(() => {
    const filter = this.filter();
    const entries = this.repo.all();
    const ofKind = filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter);
    return searchEntries(ofKind, this.query());
  });

  /** You have entries, but this filter or search hides them all. */
  protected readonly hasEntries = computed(() => this.repo.all().length > 0);

  protected readonly groups = computed(() => groupByMonth(this.visible(), this.i18n.locale()));

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  protected search(text: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.query.set(text), SEARCH_DEBOUNCE_MS);
  }

  protected setFilter(filter: KindFilterValue): void {
    void this.router.navigate([], {
      queryParams: { kind: filter === 'all' ? null : filter },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

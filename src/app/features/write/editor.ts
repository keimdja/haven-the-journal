import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { EntriesRepo } from '../../core/data/entries-repo';
import type { Entry } from '../../core/data/models';
import { Sync } from '../../core/data/sync';
import { formatLongDate, formatTime } from '../../core/i18n/format-date';
import { I18n } from '../../core/i18n/i18n';
import { Icon } from '../../shared/ui/icon/icon';
import { SaveStatus } from '../../shared/ui/save-status/save-status';

/**
 * Free writing, full-screen: a title and the page. `/write/new` starts a new
 * entry and moves to its own address, so a reload comes back to the same one.
 */
@Component({
  selector: 'app-editor',
  imports: [Icon, RouterLink, SaveStatus],
  templateUrl: './editor.html',
  host: { class: 'mx-auto flex h-dvh w-full max-w-2xl flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Editor {
  private readonly repo = inject(EntriesRepo);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  protected readonly sync = inject(Sync);
  protected readonly t = this.i18n.t;

  /** From the URL: an entry's id, or "new". */
  readonly id = input.required<string>();

  protected readonly entry = signal<Entry | null>(null);
  protected readonly title = signal('');
  protected readonly body = signal('');

  protected readonly when = computed(() => {
    const entry = this.entry();
    if (!entry) return '';
    const written = new Date(entry.writtenAt);
    const locale = this.i18n.locale();
    return `${formatLongDate(written, locale)} · ${formatTime(written, locale)}`;
  });

  constructor() {
    effect(() => void this.open(this.id()));
  }

  private async open(id: string): Promise<void> {
    if (id === 'new') {
      const created = await this.repo.create('free');
      await this.router.navigate(['/write', created.id], { replaceUrl: true });
      return;
    }
    const entry = await this.repo.byId(id);
    if (!entry) {
      await this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }
    this.entry.set(entry);
    this.title.set(entry.title ?? '');
    this.body.set(entry.body ?? '');
  }
}

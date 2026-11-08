import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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

/** How long typing has to pause before it's saved. */
export const AUTOSAVE_MS = 500;

/**
 * Free writing, full-screen: a title and the page. `/write/new` starts a new
 * entry and moves to its own address, so a reload comes back to the same one.
 *
 * Everything saves by itself as you type, and again on the way out, however
 * you leave. An entry left completely blank is removed, so opening the editor
 * and changing your mind doesn't leave an empty row in your journal.
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

  private timer: ReturnType<typeof setTimeout> | undefined;
  /** Saves run one after another, so an older one can't land on top of a newer one. */
  private saves: Promise<void> = Promise.resolve();

  constructor() {
    effect(() => void this.open(this.id()));

    // Phones can close a backgrounded app without warning, so save when it's hidden.
    const document = inject(DOCUMENT);
    const onHide = () => {
      if (document.visibilityState === 'hidden') void this.save();
    };
    document.addEventListener('visibilitychange', onHide);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('visibilitychange', onHide);
      void this.leave();
    });
  }

  protected editTitle(value: string): void {
    this.title.set(value);
    this.saveSoon();
  }

  protected editBody(value: string): void {
    this.body.set(value);
    this.saveSoon();
  }

  private saveSoon(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.save(), AUTOSAVE_MS);
  }

  private save(): Promise<void> {
    clearTimeout(this.timer);
    this.saves = this.saves.then(async () => {
      const entry = this.entry();
      if (!entry) return;
      const title = this.title().trim() || null;
      const body = this.body().trim() ? this.body() : null;
      if (title === entry.title && body === entry.body) return;
      this.entry.set(await this.repo.save({ ...entry, title, body }));
    });
    return this.saves;
  }

  private async leave(): Promise<void> {
    await this.save();
    const entry = this.entry();
    if (entry && !entry.title && !entry.body && isUnfelt(entry)) await this.repo.remove(entry.id);
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

function isUnfelt(entry: Entry): boolean {
  return entry.feelings.length === 0 && entry.customFeelings.length === 0;
}

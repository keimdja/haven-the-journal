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

import { EntriesRepo } from '../../../core/data/entries-repo';
import { isBlank } from '../../../core/data/entry-summary';
import type { Entry } from '../../../core/data/models';
import { formatLongDate } from '../../../core/i18n/format-date';
import { I18n } from '../../../core/i18n/i18n';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';
import { TextField, TextFieldInput } from '../../../shared/ui/text-field/text-field';
import { ReviewList } from '../review-list/review-list';

/** How long typing has to pause before the name is saved. */
export const AUTOSAVE_MS = 500;

/**
 * The end of a reflection: name it, read it back, jump to any part, then keep
 * it as a draft or save it. A finished reflection opened to edit has no
 * "Keep as draft", since it isn't one any more.
 */
@Component({
  selector: 'app-review',
  imports: [Button, Icon, ReviewList, RouterLink, TextField, TextFieldInput],
  templateUrl: './review.html',
  host: { class: 'mx-auto flex h-dvh w-full max-w-2xl flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Review {
  private readonly repo = inject(EntriesRepo);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  /** From the URL. */
  readonly id = input.required<string>();

  protected readonly entry = signal<Entry | null>(null);
  protected readonly when = computed(() => {
    const entry = this.entry();
    return entry ? formatLongDate(new Date(entry.writtenAt), this.i18n.locale()) : '';
  });

  private timer: ReturnType<typeof setTimeout> | undefined;
  private unsaved = false;
  private finished = false;
  private saves: Promise<void> = Promise.resolve();

  constructor() {
    effect(() => void this.open(this.id()));

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

  protected setTitle(value: string): void {
    this.entry.update((entry) => entry && { ...entry, title: value.trim() || null });
    this.unsaved = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.save(), AUTOSAVE_MS);
  }

  /** Keeps it where it was left, to come back to. */
  protected keepAsDraft(): Promise<void> {
    return this.finish('draft', ['/journal']);
  }

  /** Finishes it and shows it, read back. */
  protected saveReflection(): Promise<void> {
    return this.finish('complete', ['/entry', this.id()]);
  }

  private async finish(status: Entry['status'], destination: string[]): Promise<void> {
    const entry = this.entry();
    if (!entry) return;
    this.finished = true;
    await this.save();
    if (isBlank(entry)) {
      await this.repo.remove(entry.id);
      await this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }
    const currentStep = status === 'complete' ? null : (entry.currentStep ?? 6);
    await this.repo.save({ ...entry, status, currentStep });
    await this.router.navigate(destination, { replaceUrl: true });
  }

  private save(): Promise<void> {
    clearTimeout(this.timer);
    this.saves = this.saves.then(async () => {
      const entry = this.entry();
      if (!entry || !this.unsaved) return;
      this.unsaved = false;
      await this.repo.save(entry);
    });
    return this.saves;
  }

  /** Going back into a part is still inside the reflection, so a blank one stays for now. */
  private async leave(): Promise<void> {
    if (this.finished) return;
    const destination = this.router.currentNavigation()?.finalUrl?.toString() ?? '';
    await this.save();
    const entry = this.entry();
    if (entry && isBlank(entry) && !destination.startsWith(`/reflect/${entry.id}`)) {
      await this.repo.remove(entry.id);
    }
  }

  private async open(id: string): Promise<void> {
    const entry = await this.repo.byId(id);
    if (!entry || entry.kind !== 'reflection') {
      await this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }
    this.entry.set(entry);
  }
}

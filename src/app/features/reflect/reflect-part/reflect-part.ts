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
import { Router } from '@angular/router';

import { EntriesRepo } from '../../../core/data/entries-repo';
import { isBlank } from '../../../core/data/entry-summary';
import type { Entry, FeelingKey, PatternKey } from '../../../core/data/models';
import { partForStep, ReflectionPartKey } from '../../../core/data/reflection-parts';
import { I18n } from '../../../core/i18n/i18n';
import { FeelingsPart } from '../feelings-part/feelings-part';
import { PatternsPart } from '../patterns-part/patterns-part';
import { ReflectShell } from '../reflect-shell/reflect-shell';
import { TextPart } from '../text-part/text-part';

/** How long typing has to pause before it's saved. */
export const AUTOSAVE_MS = 500;

/** The parts answered by writing, which are also the names of their `Entry` fields. */
type TextField = Extract<ReflectionPartKey, 'whatHappened' | 'thoughts' | 'reframe' | 'gratitude'>;

/**
 * One part of a reflection (`/reflect/:id/:part`). `/reflect/new/1` starts a new
 * reflection and moves to its own address, as the editor does.
 *
 * Answers save by themselves as you write, when you move to another part, on
 * the way out, and when the app goes to the background. A draft remembers the
 * part you're on, so Save & exit picks up there. One left completely blank is
 * removed on the way out, so changing your mind doesn't leave an empty draft.
 */
@Component({
  selector: 'app-reflect-part',
  imports: [FeelingsPart, PatternsPart, ReflectShell, TextPart],
  templateUrl: './reflect-part.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflectPart {
  private readonly repo = inject(EntriesRepo);
  private readonly router = inject(Router);
  protected readonly t = inject(I18n).t;

  /** From the URL: the reflection's id, or "new". */
  readonly id = input.required<string>();
  /** From the URL: 1 to 6. */
  readonly part = input.required<string>();

  protected readonly entry = signal<Entry | null>(null);
  protected readonly current = computed(() => partForStep(Number(this.part())));

  private timer: ReturnType<typeof setTimeout> | undefined;
  private unsaved = false;
  /** Saves run one after another, so an older one can't land on top of a newer one. */
  private saves: Promise<void> = Promise.resolve();

  constructor() {
    effect(() => void this.open(this.id(), this.part()));

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

  protected setText(field: TextField, value: string): void {
    this.change({ [field]: value.trim() ? value : null });
  }

  protected setFeelings(feelings: FeelingKey[]): void {
    this.change({ feelings });
  }

  protected setCustomFeelings(customFeelings: string[]): void {
    this.change({ customFeelings });
  }

  protected setNote(value: string): void {
    this.change({ feelingsNote: value.trim() ? value : null });
  }

  protected setPatterns(patterns: PatternKey[]): void {
    this.change({ patterns });
  }

  private change(changes: Partial<Entry>): void {
    this.entry.update((entry) => entry && { ...entry, ...changes });
    this.unsaved = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.save(), AUTOSAVE_MS);
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

  /** Going on to the review is still inside the reflection, so a blank one stays for now. */
  private async leave(): Promise<void> {
    const destination = this.router.currentNavigation()?.finalUrl?.toString() ?? '';
    await this.save();
    const entry = this.entry();
    if (entry && isBlank(entry) && !destination.startsWith(`/reflect/${entry.id}`)) {
      await this.repo.remove(entry.id);
    }
  }

  /** Drafts follow you from part to part; finished reflections stay as they are. */
  private track(part: string): void {
    const step = partForStep(Number(part))?.step;
    const entry = this.entry();
    if (step && entry?.status === 'draft' && entry.currentStep !== step) {
      this.change({ currentStep: step });
    }
  }

  private async open(id: string, part: string): Promise<void> {
    if (id === 'new') {
      const created = await this.repo.create('reflection');
      await this.router.navigate(['/reflect', created.id, '1'], { replaceUrl: true });
      return;
    }
    await this.save();
    if (this.entry()?.id === id && partForStep(Number(part))) {
      this.track(part);
      return;
    }

    const entry = await this.repo.byId(id);
    if (!entry || entry.kind !== 'reflection') {
      await this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }
    if (!partForStep(Number(part))) {
      await this.router.navigate(['/reflect', id, '1'], { replaceUrl: true });
      return;
    }
    this.entry.set(entry);
    this.track(part);
  }
}

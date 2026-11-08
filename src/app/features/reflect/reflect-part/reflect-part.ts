import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { EntriesRepo } from '../../../core/data/entries-repo';
import type { Entry } from '../../../core/data/models';
import { partForStep } from '../../../core/data/reflection-parts';
import { I18n } from '../../../core/i18n/i18n';
import { ReflectShell } from '../reflect-shell/reflect-shell';

/**
 * One part of a reflection (`/reflect/:id/:part`). `/reflect/new/1` starts a new
 * reflection and moves to its own address, as the editor does.
 */
@Component({
  selector: 'app-reflect-part',
  imports: [ReflectShell],
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

  constructor() {
    effect(() => void this.open(this.id(), this.part()));
  }

  private async open(id: string, part: string): Promise<void> {
    if (id === 'new') {
      const created = await this.repo.create('reflection');
      await this.router.navigate(['/reflect', created.id, '1'], { replaceUrl: true });
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
  }
}

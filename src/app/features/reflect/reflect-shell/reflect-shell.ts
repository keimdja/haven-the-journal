import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ReflectionStep } from '../../../core/data/reflection-parts';
import { I18n } from '../../../core/i18n/i18n';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';
import { StageBar } from '../../../shared/ui/stage-bar/stage-bar';

/**
 * The frame around each reflection part: Save & exit, "Part n of 6" and the
 * stage bar above; Back, Skip for now and Continue below. The part goes inside.
 */
@Component({
  selector: 'app-reflect-shell',
  imports: [Button, Icon, RouterLink, StageBar],
  templateUrl: './reflect-shell.html',
  host: { class: 'mx-auto flex h-dvh w-full max-w-2xl flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflectShell {
  readonly entryId = input.required<string>();
  readonly step = input.required<ReflectionStep>();

  protected readonly t = inject(I18n).t;

  /** Part 1 has nothing before it. */
  protected readonly backLink = computed(() =>
    this.step() > 1 ? ['/reflect', this.entryId(), String(this.step() - 1)] : null,
  );

  /** Continue and Skip both move on; after part 6 comes the review. */
  protected readonly nextLink = computed(() => [
    '/reflect',
    this.entryId(),
    this.step() < 6 ? String(this.step() + 1) : 'review',
  ]);
}

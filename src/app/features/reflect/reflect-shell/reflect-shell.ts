import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Entry } from '../../../core/data/models';
import type { ReflectionStep } from '../../../core/data/reflection-parts';
import { Sync } from '../../../core/data/sync';
import { I18n } from '../../../core/i18n/i18n';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';
import { SaveStatus } from '../../../shared/ui/save-status/save-status';
import { StageBar } from '../../../shared/ui/stage-bar/stage-bar';
import { PartsToc } from '../parts-toc/parts-toc';

/**
 * The frame around each reflection part: Save & exit, "Part n of 6" and the
 * stage bar above; Back, Skip for now and Continue below. The part goes inside.
 * From 1024 px the parts list sits beside it, and the stage bar gives way to the
 * title and save status.
 */
@Component({
  selector: 'app-reflect-shell',
  imports: [Button, Icon, PartsToc, RouterLink, SaveStatus, StageBar],
  templateUrl: './reflect-shell.html',
  host: {
    class: 'mx-auto flex h-dvh w-full max-w-2xl flex-col lg:h-auto lg:min-h-dvh lg:max-w-none',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflectShell {
  readonly entry = input.required<Entry>();
  readonly step = input.required<ReflectionStep>();

  protected readonly t = inject(I18n).t;
  protected readonly sync = inject(Sync);

  /** Part 1 has nothing before it. */
  protected readonly backLink = computed(() =>
    this.step() > 1 ? ['/reflect', this.entry().id, String(this.step() - 1)] : null,
  );

  /** Continue and Skip both move on; after part 6 comes the review. */
  protected readonly nextLink = computed(() => [
    '/reflect',
    this.entry().id,
    this.step() < 6 ? String(this.step() + 1) : 'review',
  ]);
}

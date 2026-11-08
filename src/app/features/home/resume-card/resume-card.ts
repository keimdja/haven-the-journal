import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { entryLink } from '../../../core/data/entry-summary';
import type { Entry } from '../../../core/data/models';
import { formatWeekday } from '../../../core/i18n/format-date';
import { I18n } from '../../../core/i18n/i18n';
import { SectionLabel } from '../../../shared/ui/section-label/section-label';
import { SixDots } from '../../../shared/ui/six-dots/six-dots';

/** "Pick up where you left off": the unfinished reflection you touched last. */
@Component({
  selector: 'app-resume-card',
  imports: [RouterLink, SectionLabel, SixDots],
  templateUrl: './resume-card.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeCard {
  readonly entry = input.required<Entry>();

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly part = computed(() => this.entry().currentStep ?? 1);
  protected readonly link = computed(() => entryLink(this.entry()));
  protected readonly weekday = computed(() =>
    formatWeekday(new Date(this.entry().writtenAt), this.i18n.locale()),
  );
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { partHasAnswer } from '../../../core/data/entry-summary';
import type { Entry } from '../../../core/data/models';
import { REFLECTION_PARTS, ReflectionStep } from '../../../core/data/reflection-parts';
import { I18n } from '../../../core/i18n/i18n';

/** The six parts down the side on desktop, openable in any order. */
@Component({
  selector: 'app-parts-toc',
  imports: [RouterLink],
  templateUrl: './parts-toc.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartsToc {
  readonly entry = input.required<Entry>();
  readonly step = input.required<ReflectionStep>();

  protected readonly t = inject(I18n).t;

  protected readonly rows = computed(() =>
    REFLECTION_PARTS.map((part) => ({
      part,
      answered: partHasAnswer(part, this.entry()),
      current: part.step === this.step(),
    })),
  );
}

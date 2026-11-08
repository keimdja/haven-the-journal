import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { partHasAnswer } from '../../../core/data/entry-summary';
import type { Entry } from '../../../core/data/models';
import { REFLECTION_PARTS, ReflectionPart } from '../../../core/data/reflection-parts';
import { I18n } from '../../../core/i18n/i18n';
import { EntryFeelings } from '../entry-feelings/entry-feelings';

/** A reflection, read back: each answered part, numbered, under its question. */
@Component({
  selector: 'app-reflection-body',
  imports: [EntryFeelings],
  templateUrl: './reflection-body.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflectionBody {
  readonly entry = input.required<Entry>();

  protected readonly t = inject(I18n).t;

  /** Parts you skipped aren't shown. */
  protected readonly parts = computed(() =>
    REFLECTION_PARTS.filter((part) => partHasAnswer(part, this.entry())),
  );

  protected text(part: ReflectionPart): string | null {
    return part.kind === 'text' ? this.entry()[part.key] : null;
  }
}

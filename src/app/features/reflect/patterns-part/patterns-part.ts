import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';

import type { PatternKey } from '../../../core/data/models';
import { PATTERN_KEYS } from '../../../core/data/patterns';
import { I18n } from '../../../core/i18n/i18n';
import { CheckRow } from '../../../shared/ui/check-row/check-row';

/** Reflection part 4: the eleven thinking patterns as check rows. Bind `[(patterns)]`. */
@Component({
  selector: 'app-patterns-part',
  imports: [CheckRow],
  templateUrl: './patterns-part.html',
  host: { class: 'flex flex-col gap-3.5 pb-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatternsPart {
  readonly question = input.required<string>();
  readonly helper = input.required<string>();
  readonly patterns = model<PatternKey[]>([]);

  protected readonly t = inject(I18n).t;
  protected readonly keys = PATTERN_KEYS;

  protected isChecked(key: PatternKey): boolean {
    return this.patterns().includes(key);
  }

  /** Keeps checked patterns in the list's order, whatever order they were ticked in. */
  protected setChecked(key: PatternKey, checked: boolean): void {
    const next = new Set(this.patterns());
    if (checked) next.add(key);
    else next.delete(key);
    this.patterns.set(PATTERN_KEYS.filter((pattern) => next.has(pattern)));
  }
}

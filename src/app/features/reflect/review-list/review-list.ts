import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Entry } from '../../../core/data/models';
import { REFLECTION_PARTS, ReflectionPart } from '../../../core/data/reflection-parts';
import { I18n } from '../../../core/i18n/i18n';

interface ReviewRow {
  readonly part: ReflectionPart;
  readonly summary: string;
  /** Chips and patterns read as interface text; written answers stay in Fraunces. */
  readonly written: boolean;
}

/** The six parts at a glance: what you answered, with Edit, or Write for parts you skipped. */
@Component({
  selector: 'app-review-list',
  imports: [RouterLink],
  templateUrl: './review-list.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewList {
  readonly entry = input.required<Entry>();

  protected readonly t = inject(I18n).t;

  protected readonly rows = computed<ReviewRow[]>(() =>
    REFLECTION_PARTS.map((part) => ({
      part,
      summary: this.summary(part),
      written: part.kind === 'text',
    })),
  );

  private summary(part: ReflectionPart): string {
    const entry = this.entry();
    const copy = this.t();
    switch (part.kind) {
      case 'feelings':
        return [...entry.feelings.map((key) => copy.feelings[key]), ...entry.customFeelings].join(
          ' · ',
        );
      case 'patterns':
        return entry.patterns.map((key) => copy.patterns[key].label).join(' · ');
      default:
        return entry[part.key]?.trim() ?? '';
    }
  }
}

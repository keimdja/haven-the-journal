import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { EntryKind } from '../../../core/data/models';

/**
 * The small caps tag saying what kind of entry this is: "Reflection" in
 * lavender with its 3 × 2 dot motif, or a plain "Free writing".
 * English for now; moves to the copy files with i18n.
 */
@Component({
  selector: 'app-kind-tag',
  template: `
    @if (kind() === 'reflection') {
      <span class="grid grid-cols-[repeat(3,3px)] gap-0.5" aria-hidden="true">
        @for (dot of dots; track $index) {
          <span class="size-0.75 rounded-full bg-lavender-dot"></span>
        }
      </span>
      Reflection
    } @else {
      Free writing
    }
  `,
  host: {
    class: 'inline-flex items-center gap-1.5 text-stamp font-medium uppercase',
    '[class.text-lavender-text]': 'kind() === "reflection"',
    '[class.text-ink-soft]': 'kind() === "free"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KindTag {
  readonly kind = input.required<EntryKind>();
  protected readonly dots = Array.from({ length: 6 });
}

import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

import { Icon } from '../icon/icon';

/** Lighter feelings are sage, heavier ones clay. Custom feelings are always light. */
export type ChipWeight = 'light' | 'heavy';

/**
 * A feeling chip, in one of two modes:
 *
 * - **display** (default): a small tag for chosen feelings, coloured by `weight`.
 *   With `removable` it gets an × button that emits `remove` (custom feelings).
 * - **toggle**: a button to pick a feeling, with `aria-pressed` and a check
 *   when chosen. Bind `[(pressed)]`.
 */
@Component({
  selector: 'app-chip',
  imports: [Icon],
  template: `
    @if (toggle()) {
      <button
        type="button"
        class="inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors"
        [class]="
          pressed()
            ? 'border-olive bg-sage-tint font-medium text-olive-ink'
            : 'border-taupe-line text-ink hover:border-sage'
        "
        [attr.aria-pressed]="pressed()"
        (click)="pressed.set(!pressed())"
      >
        @if (pressed()) {
          <app-icon name="check" [size]="14" [strokeWidth]="2.2" />
        }
        {{ label() }}
      </button>
    } @else {
      <span
        class="inline-flex items-center gap-1 rounded-chip px-2.5 py-1.25 text-meta leading-tight"
        [class]="
          weight() === 'heavy' ? 'bg-clay-tint text-clay-text' : 'bg-sage-tint text-olive-ink'
        "
      >
        {{ label() }}
        @if (removable()) {
          <button
            type="button"
            class="-my-1 -mr-1.5 inline-flex size-6 items-center justify-center rounded-chip hover:bg-black/5"
            [attr.aria-label]="removeLabel() + ' ' + label()"
            (click)="remove.emit()"
          >
            <app-icon name="close" [size]="12" [strokeWidth]="2" />
          </button>
        }
      </span>
    }
  `,
  host: { class: 'inline-flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  readonly label = input.required<string>();
  readonly weight = input<ChipWeight>('light');
  /** Render as a pressable button instead of a tag. */
  readonly toggle = input(false);
  /** Toggle mode only: whether the feeling is chosen. */
  readonly pressed = model(false);
  /** Display mode only: show an × button that emits `remove`. */
  readonly removable = input(false);
  /** Start of the × button's accessible name, followed by the label ("Remove Calm"). */
  readonly removeLabel = input('Remove');

  readonly remove = output<void>();
}

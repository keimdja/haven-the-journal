import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

let nextId = 0;

/**
 * Pick one of a few options, with the chosen one lifted onto paper (Settings →
 * Language). Bind `[(value)]`.
 *
 * Each segment is a native radio button (visually hidden), so arrow keys move
 * the choice and screen readers announce "radio button, 1 of 2".
 */
@Component({
  selector: 'app-segmented-control',
  template: `
    <div
      class="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-cream p-1"
      role="radiogroup"
      [attr.aria-label]="label()"
    >
      @for (option of options(); track option.value) {
        <label
          class="flex h-11 cursor-pointer items-center justify-center rounded-[9px] transition-colors has-checked:bg-paper has-checked:font-semibold has-checked:text-ink has-checked:shadow-lifted not-has-checked:font-medium not-has-checked:text-ink-muted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-olive"
        >
          <input
            type="radio"
            class="sr-only"
            [name]="name"
            [value]="option.value"
            [checked]="option.value === value()"
            (change)="value.set(option.value)"
          />
          {{ option.label }}
        </label>
      }
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControl<T extends string> {
  readonly options = input.required<readonly SegmentOption<T>[]>();
  readonly value = model.required<T>();
  /** Accessible name for the group, e.g. "Language". */
  readonly label = input.required<string>();

  /** Groups the radios so only one can be checked and arrow keys move between them. */
  protected readonly name = `segmented-${nextId++}`;
}

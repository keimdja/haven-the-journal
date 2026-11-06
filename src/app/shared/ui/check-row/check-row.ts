import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * A full-width checkbox row: a label with an italic example under it, as in
 * the thinking-patterns step. Bind `[(checked)]`.
 *
 * It's a real checkbox (visually hidden) inside a <label>, so the whole row
 * is clickable, Space toggles it, and screen readers announce it as a checkbox.
 * Stack rows inside an element with `border-t border-hairline` for the top line.
 */
@Component({
  selector: 'app-check-row',
  imports: [Icon],
  template: `
    <label
      class="flex min-h-15 cursor-pointer items-center gap-3.5 border-b border-hairline py-2.5 pr-2.5 pl-2 transition-colors not-has-checked:hover:bg-cream has-checked:bg-sage-wash has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-olive"
    >
      <input
        #box
        type="checkbox"
        class="peer sr-only"
        [attr.aria-labelledby]="id + '-label'"
        [attr.aria-describedby]="example() ? id + '-example' : null"
        [checked]="checked()"
        (change)="checked.set(box.checked)"
      />
      <span
        class="flex size-5.5 shrink-0 items-center justify-center rounded-chip border-[1.5px] border-taupe bg-paper peer-checked:border-olive peer-checked:bg-olive"
        aria-hidden="true"
      >
        @if (checked()) {
          <app-icon class="text-ivory" name="check" [size]="13" [strokeWidth]="3" />
        }
      </span>
      <span class="flex min-w-0 flex-col gap-0.5">
        <span class="font-medium text-ink" [id]="id + '-label'">{{ label() }}</span>
        @if (example()) {
          <span
            class="font-reflect text-sm leading-snug text-ink-soft italic"
            [id]="id + '-example'"
          >
            {{ example() }}
          </span>
        }
      </span>
    </label>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckRow {
  readonly label = input.required<string>();
  /** A short quote showing what the pattern sounds like. */
  readonly example = input<string>();
  readonly checked = model(false);

  /** The label names the checkbox; the example describes it, so it's read after. */
  protected readonly id = `check-row-${nextId++}`;
}

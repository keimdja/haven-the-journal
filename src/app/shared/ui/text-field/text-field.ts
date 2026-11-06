import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  inject,
  input,
} from '@angular/core';

import { Icon } from '../icon/icon';

export type TextFieldVariant = 'field' | 'search';

let nextId = 0;

/**
 * A labelled text input. The <input> itself is yours, projected inside, so it
 * works with any forms API (reactive forms, signal forms, plain events):
 *
 *   <app-text-field label="Email" [error]="emailError()">
 *     <input appInput type="email" autocomplete="email" [formControl]="email" />
 *   </app-text-field>
 *
 * The field links the label, the input and the error message for screen readers.
 * `search` hides the label visually (it stays readable) and adds the search icon.
 */
@Component({
  selector: 'app-text-field',
  imports: [Icon],
  template: `
    <label
      class="text-meta font-medium text-ink-muted"
      [class.sr-only]="isSearch()"
      [for]="inputId"
    >
      {{ label() }}
      @if (hint()) {
        <span class="font-normal text-ink-soft">{{ hint() }}</span>
      }
    </label>

    <div class="relative">
      @if (isSearch()) {
        <app-icon
          class="pointer-events-none absolute top-3.25 left-3.5 text-ink-soft"
          name="search"
          [size]="18"
          [strokeWidth]="1.7"
        />
      }
      <ng-content />
    </div>

    @if (error()) {
      <p class="text-meta text-error" [id]="errorId">{{ error() }}</p>
    }
  `,
  host: { class: 'flex flex-col gap-1.5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextField {
  readonly label = input.required<string>();
  /** Quieter text after the label, e.g. "(optional)". */
  readonly hint = input<string>();
  /** Message shown under the input; also marks the input invalid. */
  readonly error = input<string | null>();
  readonly variant = input<TextFieldVariant>('field');
  /** Type in Fraunces at writing size, as for an entry title. */
  readonly reflect = input(false);

  readonly inputId = `text-field-${nextId++}`;
  readonly errorId = `${this.inputId}-error`;
  readonly isSearch = computed(() => this.variant() === 'search');
}

/** The input inside an `app-text-field`; takes its id, styles and error state from it. */
@Directive({
  selector: 'input[appInput]',
  host: {
    class:
      'w-full rounded-control border bg-paper px-3.5 text-ink transition-[border-color,box-shadow] ' +
      'focus:border-olive focus:ring-3 focus:ring-sage-tint focus-visible:outline-none',
    '[id]': 'field.inputId',
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'field.error() ? "true" : null',
    '[attr.aria-describedby]': 'field.error() ? field.errorId : null',
  },
})
export class TextFieldInput {
  protected readonly field = inject(TextField);

  protected readonly classes = computed(() => {
    // Stays red while focused, so the error doesn't disappear as you fix it.
    const border = this.field.error() ? 'border-error focus:border-error' : 'border-segment-ring';
    const font = this.field.reflect() ? 'h-12 font-reflect text-entry-title' : 'h-11 text-ui';
    const icon = this.field.isSearch() ? 'pl-10.5' : '';
    return `${border} ${font} ${icon}`;
  });
}

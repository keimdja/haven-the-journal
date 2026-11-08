import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * An on/off switch (Settings → Hide previews). Bind `[(checked)]`.
 *
 * Name it with `labelledBy` (the id of the visible text next to it) or `label`.
 */
@Component({
  selector: 'app-switch',
  template: `
    <button
      type="button"
      role="switch"
      class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      [class]="checked() ? 'bg-olive' : 'bg-switch-off'"
      [attr.aria-checked]="checked()"
      [attr.aria-labelledby]="labelledBy() || null"
      [attr.aria-label]="label() || null"
      (click)="checked.set(!checked())"
    >
      <span
        class="absolute top-0.75 left-0.75 size-5.5 rounded-full bg-paper shadow-knob transition-transform"
        [class.translate-x-5]="checked()"
        aria-hidden="true"
      ></span>
    </button>
  `,
  host: { class: 'inline-flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Switch {
  readonly checked = model(false);
  /** Id of the element that names the switch. */
  readonly labelledBy = input<string>();
  /** Accessible name, when there's no visible label to point to. */
  readonly label = input<string>();
}

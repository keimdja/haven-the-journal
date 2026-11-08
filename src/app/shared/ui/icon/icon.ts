import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICONS, IconDefinition, IconName } from './icons';

/**
 * An inline SVG icon from the design's set. It takes the surrounding text colour
 * (`currentColor`), so colour it with a `text-*` class on it or its parent.
 *
 * Decorative by default (hidden from screen readers). Pass `label` when the icon
 * carries meaning on its own, e.g. an icon-only button without visible text.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="icon().filled ? 'currentColor' : 'none'"
      [attr.stroke]="icon().filled ? null : 'currentColor'"
      [attr.stroke-width]="icon().filled ? null : strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <path [attr.d]="icon().d" />
    </svg>
  `,
  host: {
    class: 'inline-flex shrink-0',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
  /** Width and height in px. */
  readonly size = input(20);
  /** Outline thickness; the design uses 1.6 for most icons and 2 for small checks. */
  readonly strokeWidth = input(1.6);
  /** Accessible name. Leave empty for decorative icons. */
  readonly label = input<string>();

  protected readonly icon = computed<IconDefinition>(() => ICONS[this.name()]);
}

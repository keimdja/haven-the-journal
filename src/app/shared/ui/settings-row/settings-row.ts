import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icons';

let nextId = 0;

/**
 * One row of the Settings list. Use the element for a static row, or put it on
 * a link or button for a row you can press:
 *
 *   <app-settings-row label="Email" value="k@example.com" />
 *   <a app-settings-row label="Finding support" routerLink="…" [chevron]="true"></a>
 *   <button app-settings-row label="Export journal" sub="…" icon="download"></button>
 *
 * Anything inside goes at the end of the row, e.g. a switch named by the row:
 *
 *   <app-settings-row #row label="Hide previews on Home" sub="…">
 *     <app-switch [labelledBy]="row.labelId" [(checked)]="hide" />
 *   </app-settings-row>
 *
 * Rows draw no lines of their own; separate them with `divide-y divide-hairline-soft`.
 */
@Component({
  selector: 'app-settings-row, a[app-settings-row], button[app-settings-row]',
  imports: [Icon],
  template: `
    @if (icon(); as icon) {
      <app-icon [class]="danger() ? '' : 'text-olive'" [name]="icon" />
    }
    <span class="flex min-w-0 flex-1 flex-col gap-0.75">
      <span [class.font-medium]="danger()" [id]="labelId">{{ label() }}</span>
      @if (sub()) {
        <span class="text-meta leading-snug text-ink-soft">{{ sub() }}</span>
      }
    </span>
    @if (value()) {
      <span class="text-ink-soft">{{ value() }}</span>
    }
    <ng-content />
    @if (chevron()) {
      <app-icon class="text-ink-soft" name="chevron-right" [size]="16" [strokeWidth]="1.7" />
    }
  `,
  host: {
    class: 'flex min-h-13 w-full items-center gap-3.5 px-6 py-3.5 text-left no-underline',
    '[class]': 'stateClass()',
    '[attr.type]': 'isButton ? "button" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsRow {
  readonly label = input.required<string>();
  /** Smaller explanation under the label. */
  readonly sub = input<string>();
  /** Read-only value at the end of the row ("k@example.com"). */
  readonly value = input<string>();
  /** Leading icon, for action rows like Export journal. */
  readonly icon = input<IconName>();
  /** Trailing chevron, for rows that open another page. */
  readonly chevron = input(false);
  /** Red text for destructive rows. */
  readonly danger = input(false);

  /** Id of the label, so a control inside the row can be named by it. */
  readonly labelId = `settings-row-${nextId++}`;

  private readonly tag = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName;
  protected readonly isButton = this.tag === 'BUTTON';
  private readonly pressable = this.isButton || this.tag === 'A';

  protected readonly stateClass = computed(() => {
    const tone = this.danger() ? 'text-error' : 'text-ink';
    return this.pressable ? `${tone} transition-colors hover:bg-cream` : tone;
  });
}

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { I18n } from '../../../core/i18n/i18n';
import { Icon } from '../../../shared/ui/icon/icon';

/**
 * "Need a nudge?": prompts that open under a small button; tapping one adds it
 * to the page. A part with a single line (gratitude) just shows it, as a gentle
 * hint rather than something to fill in.
 */
@Component({
  selector: 'app-nudges',
  imports: [Icon],
  templateUrl: './nudges.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nudges {
  readonly prompts = input.required<readonly string[]>();
  readonly pick = output<string>();

  protected readonly t = inject(I18n).t;
  protected readonly open = signal(false);

  constructor() {
    // Moving to the next part starts with its prompts closed.
    effect(() => {
      this.prompts();
      this.open.set(false);
    });
  }
}

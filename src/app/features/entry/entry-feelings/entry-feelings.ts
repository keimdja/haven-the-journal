import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { feelingWeight } from '../../../core/data/feelings';
import type { Entry } from '../../../core/data/models';
import { I18n } from '../../../core/i18n/i18n';
import { Chip } from '../../../shared/ui/chip/chip';

/** An entry's feelings as chips: presets by weight, then the ones you typed. */
@Component({
  selector: 'app-entry-feelings',
  imports: [Chip],
  templateUrl: './entry-feelings.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryFeelings {
  readonly entry = input.required<Entry>();

  protected readonly t = inject(I18n).t;
  protected readonly weightOf = feelingWeight;
}

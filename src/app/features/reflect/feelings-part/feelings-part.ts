import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';

import type { FeelingKey } from '../../../core/data/models';
import { I18n } from '../../../core/i18n/i18n';
import { FeelingPicker } from '../../../shared/feeling-picker/feeling-picker';

/** Reflection part 3: the question, the feeling picker shown open, and a note. */
@Component({
  selector: 'app-feelings-part',
  imports: [FeelingPicker],
  templateUrl: './feelings-part.html',
  host: { class: 'flex flex-col gap-5 pb-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeelingsPart {
  readonly question = input.required<string>();
  readonly helper = input.required<string>();
  readonly feelings = model<FeelingKey[]>([]);
  readonly customFeelings = model<string[]>([]);
  readonly note = model('');

  protected readonly t = inject(I18n).t;
}

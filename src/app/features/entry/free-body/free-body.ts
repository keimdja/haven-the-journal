import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Entry } from '../../../core/data/models';
import { EntryFeelings } from '../entry-feelings/entry-feelings';

/** Free writing, read back: the words as you wrote them, then any feelings. */
@Component({
  selector: 'app-free-body',
  imports: [EntryFeelings],
  templateUrl: './free-body.html',
  host: { class: 'flex flex-col gap-6 pt-6.5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreeBody {
  readonly entry = input.required<Entry>();

  protected readonly hasFeelings = computed(
    () => this.entry().feelings.length + this.entry().customFeelings.length > 0,
  );
}

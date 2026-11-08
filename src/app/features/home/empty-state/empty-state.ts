import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18n } from '../../../core/i18n/i18n';

/** The small sprout and note on Home before anything has been written. */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  protected readonly t = inject(I18n).t;
}

import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { I18n } from '../../../core/i18n/i18n';

export const KIND_FILTERS = ['all', 'free', 'reflection'] as const;
export type KindFilterValue = (typeof KIND_FILTERS)[number];

/** All · Free writing · Reflections, above the Journal list. */
@Component({
  selector: 'app-kind-filter',
  templateUrl: './kind-filter.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KindFilter {
  readonly value = input.required<KindFilterValue>();
  readonly valueChange = output<KindFilterValue>();

  protected readonly t = inject(I18n).t;
  protected readonly filters = KIND_FILTERS;
}

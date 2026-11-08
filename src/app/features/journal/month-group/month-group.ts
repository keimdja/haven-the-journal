import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { entryLink, entryPreview } from '../../../core/data/entry-summary';
import { EntryRow } from '../../../shared/ui/entry-row/entry-row';
import { SectionLabel } from '../../../shared/ui/section-label/section-label';
import type { MonthGroupData } from '../month-groups';

/** One month of the Journal: its heading and its entries. */
@Component({
  selector: 'app-month-group',
  imports: [EntryRow, RouterLink, SectionLabel],
  templateUrl: './month-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthGroup {
  readonly group = input.required<MonthGroupData>();

  protected readonly link = entryLink;
  protected readonly preview = entryPreview;
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DateStamp } from '../date-stamp/date-stamp';
import { EntryKind, KindTag } from '../kind-tag/kind-tag';

/**
 * One entry in a list (Home "Recently", Journal). Put it on the link that opens
 * the entry:
 *
 *   <a app-entry-row [routerLink]="['/entry', e.id]" [date]="e.writtenAt"
 *      [title]="e.title" [preview]="e.body" kind="free"></a>
 *
 * - With a title: the title, then up to two lines of preview.
 * - Without one: the opening words in italic Fraunces, standing in for the title.
 * - `hidePreview` (the Settings privacy option) shows titles only.
 * - `draftPart` adds "Draft · 3 of 6" for unfinished reflections.
 *
 * Rows underline their title on hover and separate themselves with a hairline,
 * except the last one in the list.
 */
@Component({
  selector: 'a[app-entry-row]',
  imports: [DateStamp, KindTag],
  template: `
    <app-date-stamp [date]="date()" [locale]="locale()" />

    <span
      class="flex min-w-0 flex-1 flex-col gap-1.25 border-b border-hairline pb-3.5 group-last:border-b-0"
    >
      @if (showKind() || draftPart()) {
        <span class="flex items-center gap-2">
          @if (showKind()) {
            <app-kind-tag [kind]="kind()" />
          }
          @if (draftPart(); as part) {
            <span
              class="inline-flex items-center gap-1.5 text-stamp font-medium text-clay-ink uppercase"
            >
              <span class="size-1.25 rounded-full bg-clay" aria-hidden="true"></span>
              Draft · {{ part }} of 6
            </span>
          }
        </span>
      }

      @if (title()) {
        <span class="entry-title font-reflect text-entry-title">{{ title() }}</span>
        @if (showPreview()) {
          <span class="line-clamp-2 text-sm leading-[1.45] text-ink-soft">{{ preview() }}</span>
        }
      } @else if (showPreview()) {
        <span class="entry-title line-clamp-2 font-reflect text-[17px] leading-[1.4] italic">
          {{ preview() }}
        </span>
      } @else {
        <span class="entry-title font-reflect text-entry-title text-ink-soft">{{
          untitledLabel()
        }}</span>
      }
    </span>
  `,
  host: {
    class:
      'group flex gap-4.5 pt-3.5 text-ink no-underline [&:hover_.entry-title]:underline ' +
      '[&:hover_.entry-title]:decoration-taupe-soft [&:hover_.entry-title]:underline-offset-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryRow {
  /** When it was written. */
  readonly date = input.required<Date | string>();
  readonly title = input<string | null>();
  /** The start of what was written. */
  readonly preview = input<string | null>();
  readonly kind = input<EntryKind>('free');
  /** Show the Reflection / Free writing tag (Journal shows it, Home doesn't). */
  readonly showKind = input(false);
  /** For draft reflections: the part they stopped at, 1 to 6. */
  readonly draftPart = input<number | null>();
  /** Titles only, nothing of what was written. */
  readonly hidePreview = input(false);
  readonly untitledLabel = input('Untitled');
  readonly locale = input('en');

  protected readonly showPreview = computed(() => !this.hidePreview() && !!this.preview()?.trim());
}

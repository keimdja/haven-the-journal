import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { formatStamp } from '../../../core/i18n/format-date';

/**
 * The "20 / TUE" column at the start of an entry row: the day of the month in
 * Fraunces over a short weekday ("20 / TUE", "20 / MAR").
 */
@Component({
  selector: 'app-date-stamp',
  template: `
    <time
      class="flex w-8.5 flex-col items-center pt-0.5"
      [class]="large() ? 'lg:w-11 lg:items-start lg:pt-0' : ''"
      [attr.datetime]="isoDate()"
    >
      <span class="font-reflect text-[24px] leading-none" [class.lg:text-[30px]]="large()">{{
        stamp().day
      }}</span>
      <span class="mt-1 text-stamp text-ink-soft uppercase">{{ stamp().weekday }}</span>
    </time>
  `,
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateStamp {
  /** When the entry was written. */
  readonly date = input.required<Date | string>();
  readonly locale = input('en');
  /** Bigger from 1024 px, for Desktop Home. */
  readonly large = input(false);

  private readonly value = computed(() => new Date(this.date()));

  protected readonly stamp = computed(() => formatStamp(this.value(), this.locale()));
  /** Local calendar date, e.g. 2026-10-20, for the <time> element. */
  protected readonly isoDate = computed(() => {
    const d = this.value();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
}

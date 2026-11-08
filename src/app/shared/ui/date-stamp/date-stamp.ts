import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The "20 / TUE" column at the start of an entry row: the day of the month in
 * Fraunces over a short weekday. Uses the browser's Intl, so Spanish needs no
 * extra locale data ("20 / MAR").
 */
@Component({
  selector: 'app-date-stamp',
  template: `
    <time class="flex w-8.5 flex-col items-center pt-0.5" [attr.datetime]="isoDate()">
      <span class="font-reflect text-[24px] leading-none">{{ day() }}</span>
      <span class="mt-1 text-stamp text-ink-soft uppercase">{{ weekday() }}</span>
    </time>
  `,
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateStamp {
  /** When the entry was written. */
  readonly date = input.required<Date | string>();
  readonly locale = input('en');

  private readonly value = computed(() => new Date(this.date()));

  protected readonly day = computed(() => this.value().getDate());
  protected readonly weekday = computed(() =>
    new Intl.DateTimeFormat(this.locale(), { weekday: 'short' })
      .format(this.value())
      .replace('.', ''),
  );
  /** Local calendar date, e.g. 2026-10-20, for the <time> element. */
  protected readonly isoDate = computed(() => {
    const d = this.value();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
}

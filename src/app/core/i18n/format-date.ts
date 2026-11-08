/**
 * Date and time formats used across the app, for a locale from `I18n.locale()`.
 * Built on the browser's Intl, so Spanish needs no extra locale data.
 *
 *   formatLongDate  Wednesday, October 21    ·  Miércoles, 21 de octubre
 *   formatStamp     { day: '21', weekday: 'Wed' }  ·  { day: '21', weekday: 'mié' }
 *   formatMonth     October 2026             ·  Octubre de 2026
 *   formatTime      9:12 pm                  ·  9:12 p. m.
 */

/** Spanish writes weekdays and months in lowercase; headings in the design start with a capital. */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

function format(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Home's date line and entry headers. Add the year for entries from the past. */
export function formatLongDate(date: Date, locale: string, withYear = false): string {
  return capitalize(
    format(date, locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: withYear ? 'numeric' : undefined,
    }),
  );
}

/** The two halves of the date column in entry rows. Shown in caps by the component. */
export function formatStamp(date: Date, locale: string): { day: string; weekday: string } {
  return {
    day: String(date.getDate()),
    weekday: format(date, locale, { weekday: 'short' }).replace('.', ''),
  };
}

/** Month headings in the Journal list. */
export function formatMonth(date: Date, locale: string): string {
  return capitalize(format(date, locale, { month: 'long', year: 'numeric' }));
}

/** Time an entry was written, in the design's lowercase "9:12 pm" style. */
export function formatTime(date: Date, locale: string): string {
  return format(date, locale, { hour: 'numeric', minute: '2-digit' }).toLocaleLowerCase();
}

import { formatLongDate, formatMonth, formatStamp, formatTime } from './format-date';

// Built from local parts, so the results don't depend on the test machine's timezone.
const evening = new Date(2026, 9, 21, 21, 12);
const morning = new Date(2026, 9, 21, 9, 5);

/** Intl puts a narrow no-break space before am/pm; compare with plain spaces. */
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('format-date', () => {
  describe('en-US', () => {
    const locale = 'en-US';

    it('formats the long date, with or without the year', () => {
      expect(formatLongDate(evening, locale)).toBe('Wednesday, October 21');
      expect(formatLongDate(evening, locale, true)).toBe('Wednesday, October 21, 2026');
    });

    it('splits the stamp into day and short weekday', () => {
      expect(formatStamp(evening, locale)).toEqual({ day: '21', weekday: 'Wed' });
    });

    it('formats the month heading', () => {
      expect(formatMonth(evening, locale)).toBe('October 2026');
    });

    it('formats the time in lowercase, 12-hour', () => {
      expect(plain(formatTime(evening, locale))).toBe('9:12 pm');
      expect(plain(formatTime(morning, locale))).toBe('9:05 am');
    });
  });

  describe('es-PR', () => {
    const locale = 'es-PR';

    it('capitalizes the long date', () => {
      expect(formatLongDate(evening, locale)).toBe('Miércoles, 21 de octubre');
      expect(formatLongDate(evening, locale, true)).toBe('Miércoles, 21 de octubre de 2026');
    });

    it('uses the Spanish short weekday without a trailing period', () => {
      expect(formatStamp(evening, locale)).toEqual({ day: '21', weekday: 'mié' });
    });

    it('capitalizes the month heading', () => {
      expect(formatMonth(evening, locale)).toBe('Octubre de 2026');
    });

    it('formats the time in Puerto Rico’s 12-hour style', () => {
      expect(plain(formatTime(evening, locale))).toBe('9:12 p. m.');
    });
  });
});

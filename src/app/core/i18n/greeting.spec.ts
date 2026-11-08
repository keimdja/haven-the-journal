import { en } from './copy/en';
import { es } from './copy/es';
import { greeting, partOfDay } from './greeting';

const at = (hour: number, minute = 0) => new Date(2026, 9, 21, hour, minute);

describe('greeting', () => {
  it.each([
    [4, 59, 'evening'],
    [5, 0, 'morning'],
    [11, 59, 'morning'],
    [12, 0, 'afternoon'],
    [17, 59, 'afternoon'],
    [18, 0, 'evening'],
    [0, 30, 'evening'],
  ])('%i:%i is %s', (hour, minute, expected) => {
    expect(partOfDay(at(hour, minute))).toBe(expected);
  });

  it('greets by name', () => {
    expect(greeting(at(21), en, 'K')).toBe('Good evening, K.');
    expect(greeting(at(8), es, 'K')).toBe('Buenos días, K.');
  });

  it('greets without a name while it isn’t known', () => {
    expect(greeting(at(14), en)).toBe('Good afternoon.');
    expect(greeting(at(14), es, '  ')).toBe('Buenas tardes.');
  });
});

import { en } from '../i18n/copy/en';
import { es } from '../i18n/copy/es';
import { FEELING_KEYS, feelingWeight } from './feelings';
import { PATTERN_KEYS } from './patterns';
import { REFLECTION_PARTS, partForStep } from './reflection-parts';

describe('reference data', () => {
  it('has the 14 feelings the database accepts, lighter ones first', () => {
    // Same list and order as the check on entries.feelings in supabase/001_schema.sql.
    expect(FEELING_KEYS).toEqual([
      'calm',
      'content',
      'grateful',
      'hopeful',
      'tender',
      'relieved',
      'proud',
      'tired',
      'restless',
      'unsure',
      'anxious',
      'sad',
      'frustrated',
      'lonely',
    ]);
    expect(feelingWeight('proud')).toBe('light');
    expect(feelingWeight('tired')).toBe('heavy');
  });

  it('has the 11 patterns the database accepts', () => {
    expect(PATTERN_KEYS).toHaveLength(11);
    expect(new Set(PATTERN_KEYS).size).toBe(11);
  });

  it('numbers the six parts 1 to 6, in order', () => {
    expect(REFLECTION_PARTS.map((part) => part.step)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(partForStep(3)?.kind).toBe('feelings');
    expect(partForStep(7)).toBeUndefined();
  });

  it.each([
    ['English', en],
    ['Spanish', es],
  ])('has %s words for every feeling, pattern and part', (_, copy) => {
    for (const key of FEELING_KEYS) expect(copy.feelings[key]).toBeTruthy();
    for (const key of PATTERN_KEYS) {
      expect(copy.patterns[key].label).toBeTruthy();
      expect(copy.patterns[key].example).toBeTruthy();
    }
    for (const part of REFLECTION_PARTS) {
      const words = copy.reflect.parts[part.key];
      expect(words.question).toBeTruthy();
      expect(words.helper).toBeTruthy();
      // Text parts offer nudges; the chip and checkbox parts don't.
      expect(words.nudges.length > 0).toBe(part.kind === 'text');
    }
  });
});

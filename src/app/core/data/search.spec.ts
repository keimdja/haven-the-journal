import { blankEntry } from './entries-repo';
import type { Entry } from './models';
import { fold, searchEntries } from './search';

const entry = (changes: Partial<Entry>): Entry => ({ ...blankEntry('free'), ...changes });

describe('search', () => {
  const abuela = entry({
    title: 'Sunday at Abuela’s',
    body: 'She showed me how to fold pasteles.',
  });
  const reflexion = entry({ kind: 'reflection', reframe: 'Una reflexión sobre la reunión.' });
  const custom = entry({ body: 'Long day.', customFeelings: ['Embarrassed'] });
  const all = [abuela, reflexion, custom];

  it('folds case and accents', () => {
    expect(fold('Reflexión ÁRBOL')).toBe('reflexion arbol');
  });

  it('ignores case and accents in both directions', () => {
    expect(searchEntries(all, 'abuela')).toEqual([abuela]);
    expect(searchEntries(all, 'reflexion')).toEqual([reflexion]);
    expect(searchEntries(all, 'REUNIÓN')).toEqual([reflexion]);
  });

  it('looks in every text field, including custom feelings', () => {
    expect(searchEntries(all, 'pasteles')).toEqual([abuela]);
    expect(searchEntries(all, 'embarrassed')).toEqual([custom]);
  });

  it('needs every word, in any order', () => {
    expect(searchEntries(all, 'pasteles sunday')).toEqual([abuela]);
    expect(searchEntries(all, 'pasteles reunion')).toEqual([]);
  });

  it('returns everything for an empty query', () => {
    expect(searchEntries(all, '   ')).toEqual(all);
  });
});

import { blankEntry } from './entries-repo';
import { entryLink, entryPreview } from './entry-summary';
import type { Entry } from './models';

const free = (body: string | null): Entry => ({ ...blankEntry('free'), id: 'a', body });
const reflection = (changes: Partial<Entry>): Entry => ({
  ...blankEntry('reflection'),
  id: 'b',
  ...changes,
});

describe('entry summary', () => {
  it('previews free writing with its body', () => {
    expect(entryPreview(free('Words'))).toBe('Words');
    expect(entryPreview(free('   '))).toBeNull();
  });

  it('previews a reflection with its first answered part', () => {
    expect(entryPreview(reflection({ whatHappened: 'First', thoughts: 'Second' }))).toBe('First');
    expect(entryPreview(reflection({ whatHappened: ' ', thoughts: 'Second' }))).toBe('Second');
    expect(entryPreview(reflection({}))).toBeNull();
  });

  it('opens finished entries to read', () => {
    expect(entryLink(free('Words'))).toEqual(['/entry', 'a']);
    expect(entryLink(reflection({ status: 'complete' }))).toEqual(['/entry', 'b']);
  });

  it('resumes a draft reflection where it stopped', () => {
    expect(entryLink(reflection({ currentStep: 3 }))).toEqual(['/reflect', 'b', '3']);
  });
});

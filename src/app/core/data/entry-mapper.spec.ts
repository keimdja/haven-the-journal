import { blankEntry } from './entries-repo';
import { EntryRow, fromRow, toRow } from './entry-mapper';
import type { LocalEntry } from './local-db';
import type { Entry } from './models';

const reflection: Entry = {
  ...blankEntry('reflection', new Date('2026-10-20T20:40:00.000Z')),
  title: 'The meeting with Ana',
  whatHappened: 'She pushed back on the timeline.',
  thoughts: 'That everyone noticed my tone.',
  feelings: ['anxious', 'frustrated'],
  customFeelings: ['Embarrassed'],
  feelingsNote: 'Hot in the face.',
  patterns: ['reading_minds'],
  reframe: 'She may have been worried about the timeline.',
  gratitude: 'A slow dinner.',
  currentStep: 6,
  updatedAt: '2026-10-20T20:45:00.000Z',
};

describe('entry mapper', () => {
  it('turns an entry into a snake_case row', () => {
    const row = toRow(reflection);
    expect(row).toMatchObject({
      what_happened: 'She pushed back on the timeline.',
      custom_feelings: ['Embarrassed'],
      feelings_note: 'Hot in the face.',
      current_step: 6,
      written_at: '2026-10-20T20:40:00.000Z',
      deleted_at: null,
    });
  });

  it('leaves out what the server or this device owns', () => {
    const local: LocalEntry = { ...reflection, dirty: 1 };
    const row = toRow(local);
    expect('dirty' in row).toBe(false);
    expect('updated_at' in row).toBe(false);
    expect('user_id' in row).toBe(false);
  });

  it('round-trips an entry unchanged', () => {
    const row: EntryRow = { ...toRow(reflection), updated_at: reflection.updatedAt! };
    expect(fromRow(row)).toEqual(reflection);
  });

  it('reads Postgres timestamps into the app’s format, ignoring extra columns', () => {
    const row = {
      ...toRow(reflection),
      written_at: '2026-10-20 20:40:00+00',
      client_updated_at: '2026-10-20T20:44:59.123456+00:00',
      updated_at: '2026-10-20T20:45:00.5+00:00',
      deleted_at: '2026-10-21T08:00:00+00:00',
      user_id: 'user-1',
    } as EntryRow;

    expect(fromRow(row)).toMatchObject({
      writtenAt: '2026-10-20T20:40:00.000Z',
      clientUpdatedAt: '2026-10-20T20:44:59.123Z',
      updatedAt: '2026-10-20T20:45:00.500Z',
      deletedAt: '2026-10-21T08:00:00.000Z',
    });
    expect('userId' in fromRow(row)).toBe(false);
  });
});

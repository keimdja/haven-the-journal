import { blankEntry } from './entries-repo';
import type { LocalEntry } from './local-db';
import type { Entry } from './models';
import { resolve } from './resolve';

const remote: Entry = { ...blankEntry('free'), clientUpdatedAt: '2026-10-21T21:00:00.000Z' };
const local = (dirty: 0 | 1, clientUpdatedAt: string): LocalEntry => ({
  ...remote,
  dirty,
  clientUpdatedAt,
});

describe('resolve', () => {
  it('takes the server’s version when there’s no local copy', () => {
    expect(resolve(undefined, remote)).toBe('take-remote');
  });

  it('takes the server’s version over a clean local copy', () => {
    expect(resolve(local(0, '2026-10-21T22:00:00.000Z'), remote)).toBe('take-remote');
  });

  it('keeps unpushed local changes that are newer', () => {
    expect(resolve(local(1, '2026-10-21T21:00:01.000Z'), remote)).toBe('keep-local');
  });

  it('takes a newer server edit over older unpushed changes', () => {
    expect(resolve(local(1, '2026-10-21T20:59:59.000Z'), remote)).toBe('take-remote');
  });

  it('takes the server’s copy of the very version this device pushed', () => {
    expect(resolve(local(1, remote.clientUpdatedAt), remote)).toBe('take-remote');
  });
});

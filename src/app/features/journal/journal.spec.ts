import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../core/data/entries-repo';
import type { Entry } from '../../core/data/models';
import { Journal } from './journal';
import { groupByMonth } from './month-groups';

const entry = (id: string, written: Date, changes: Partial<Entry> = {}): Entry => ({
  ...blankEntry('free', written),
  id,
  ...changes,
});

describe('groupByMonth', () => {
  it('splits newest-first entries into months', () => {
    const groups = groupByMonth(
      [
        entry('c', new Date(2026, 9, 20)),
        entry('b', new Date(2026, 9, 1)),
        entry('a', new Date(2026, 8, 29)),
      ],
      'en-US',
    );
    expect(groups.map((group) => group.label)).toEqual(['October 2026', 'September 2026']);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['c', 'b']);
  });

  it('keeps the same month of different years apart', () => {
    const groups = groupByMonth(
      [entry('b', new Date(2026, 9, 1)), entry('a', new Date(2025, 9, 1))],
      'es-PR',
    );
    expect(groups.map((group) => group.label)).toEqual(['Octubre de 2026', 'Octubre de 2025']);
  });
});

describe('Journal', () => {
  beforeEach(() => localStorage.clear());

  function setup(entries: Entry[], loaded = true) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: EntriesRepo, useValue: { all: signal(entries), loaded: signal(loaded) } },
      ],
    });
    const fixture = TestBed.createComponent(Journal);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists entries under their months', () => {
    const host = setup([
      entry('b', new Date(2026, 9, 20), { title: 'The meeting', body: 'Words' }),
      entry('a', new Date(2026, 8, 29), { title: 'Notes from the bus' }),
    ]);
    expect(Array.from(host.querySelectorAll('h2')).map((h) => h.textContent?.trim())).toEqual([
      'October 2026',
      'September 2026',
    ]);
    const rows = host.querySelectorAll('a[app-entry-row]');
    expect(rows).toHaveLength(2);
    expect(rows[0].getAttribute('href')).toBe('/entry/b');
    expect(rows[0].textContent).toContain('Free writing');
  });

  it('shows draft progress and links drafts back into the reflection', () => {
    const host = setup([
      entry('d', new Date(2026, 9, 17), { kind: 'reflection', status: 'draft', currentStep: 3 }),
    ]);
    const row = host.querySelector('a[app-entry-row]')!;
    expect(row.textContent).toContain('Draft · 3 of 6');
    expect(row.getAttribute('href')).toBe('/reflect/d/3');
  });

  it('says so when there are no entries', () => {
    expect(setup([]).textContent).toContain('Nothing here yet');
  });

  it('doesn’t flash the empty message while loading', () => {
    expect(setup([], false).textContent).not.toContain('Nothing here yet');
  });
});

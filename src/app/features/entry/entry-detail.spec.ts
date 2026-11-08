import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../core/data/entries-repo';
import type { Entry } from '../../core/data/models';
import { EntryDetail } from './entry-detail';

const free: Entry = {
  ...blankEntry('free', new Date(2026, 9, 18, 16, 5)),
  id: 'free-1',
  title: 'Sunday at Abuela’s',
  body: 'First line.\nSecond line.',
  feelings: ['tender'],
  customFeelings: ['Small'],
};

const reflection: Entry = {
  ...blankEntry('reflection', new Date(2026, 9, 20, 20, 40)),
  id: 'ref-1',
  status: 'complete',
  title: 'The meeting with Ana',
  whatHappened: 'She pushed back.',
  feelings: ['anxious'],
  feelingsNote: 'Hot in the face.',
  patterns: ['reading_minds'],
  gratitude: 'A slow dinner.',
};

describe('EntryDetail', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  function open(id: string, entries: Entry[], loaded = true) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: EntriesRepo, useValue: { all: signal(entries), loaded: signal(loaded) } },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(EntryDetail);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    TestBed.tick();
    return { router, host: fixture.nativeElement as HTMLElement };
  }

  it('shows free writing with its kind, title, date, words and feelings', () => {
    const { host } = open('free-1', [free]);
    expect(host.querySelector('app-kind-tag')!.textContent).toContain('Free writing');
    expect(host.querySelector('h1')!.textContent).toContain('Sunday at Abuela’s');
    expect(host.textContent?.replace(/\s/g, ' ')).toContain('Sunday, October 18, 2026 · 4:05 pm');
    expect(host.querySelector('app-free-body p')!.textContent).toBe('First line.\nSecond line.');
    expect(host.textContent).toContain('Tender');
    expect(host.textContent).toContain('Small');
  });

  it('shows “Untitled” when there is no title', () => {
    const { host } = open('free-1', [{ ...free, title: null }]);
    expect(host.querySelector('h1')!.textContent).toContain('Untitled');
  });

  it('edits free writing in the editor', () => {
    const { host } = open('free-1', [free]);
    const links = Array.from(host.querySelectorAll('header a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/journal', '/write/free-1']);
  });

  it('numbers a reflection’s answered parts under their questions, skipping the rest', () => {
    const { host } = open('ref-1', [reflection]);
    const headings = Array.from(host.querySelectorAll('app-reflection-body h2')).map((h) =>
      h.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(headings).toEqual([
      '1 What happened?',
      '3 What did I feel?',
      '4 What thinking patterns do I recognize?',
      '6 What am I grateful for?',
    ]);
    expect(host.textContent).toContain('Hot in the face.');
    expect(host.textContent).toContain('Reading minds');
  });

  it('edits a reflection from its review', () => {
    const { host } = open('ref-1', [reflection]);
    expect(host.querySelectorAll('header a')[1].getAttribute('href')).toBe('/reflect/ref-1/review');
  });

  it('goes to the Journal if the entry doesn’t exist', () => {
    const { router } = open('missing', [free]);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/journal', { replaceUrl: true });
  });

  it('waits for the list before deciding it doesn’t exist', () => {
    const { router } = open('free-1', [], false);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

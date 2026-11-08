import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../core/data/entries-repo';
import type { Entry, Profile } from '../../core/data/models';
import { ProfileStore } from '../../core/data/profile-store';
import { Home } from './home';

describe('Home', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  function render(
    profile: Partial<Profile> | null = null,
    { recent = [] as Entry[], draft = undefined as Entry | undefined } = {},
  ) {
    vi.useFakeTimers({ now: new Date(2026, 9, 21, 21, 12), toFake: ['Date'] });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProfileStore, useValue: { profile: signal(profile) } },
        { provide: EntriesRepo, useValue: { recent: signal(recent), newestDraft: signal(draft) } },
      ],
    });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows today’s date and a greeting by name', () => {
    const host = render({ displayName: 'K' });
    expect(host.textContent).toContain('Wednesday, October 21');
    expect(host.querySelector('h1')!.textContent).toContain('Good evening, K.');
  });

  it('greets without a name until there is one', () => {
    expect(render().querySelector('h1')!.textContent).toContain('Good evening.');
  });

  it('starts free writing or a reflection', () => {
    const host = render();
    const links = Array.from(host.querySelectorAll('nav a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/write/new', '/reflect/new/1']);
    expect(links[0].textContent).toContain('Write freely');
    expect(links[1].textContent).toContain('Start a reflection');
    expect(host.querySelector('nav')!.getAttribute('aria-label')).toBe('Start writing');
  });

  const entry = (id: string, changes: Partial<Entry> = {}): Entry => ({
    ...blankEntry('free', new Date(2026, 9, 18, 16, 0)),
    id,
    ...changes,
  });

  it('shows no resume card or recent section when there’s nothing yet', () => {
    const host = render();
    expect(host.querySelector('app-resume-card')).toBeNull();
    expect(host.textContent).not.toContain('Recently');
  });

  it('offers to resume the newest draft, at the part it stopped', () => {
    const draft = entry('d1', {
      kind: 'reflection',
      status: 'draft',
      currentStep: 3,
      title: 'After the call',
      writtenAt: new Date(2026, 9, 17, 12, 0).toISOString(),
    });
    const host = render(null, { draft });
    const card = host.querySelector('app-resume-card')!;

    expect(card.textContent).toContain('Pick up where you left off');
    expect(card.textContent).toContain('After the call');
    expect(card.textContent?.replace(/\s+/g, ' ')).toContain('Reflection · 3 of 6 · Saturday');
    expect(card.querySelectorAll('app-six-dots span.bg-olive')).toHaveLength(3);
    expect(card.querySelector('a')!.getAttribute('href')).toBe('/reflect/d1/3');
  });

  it('lists recent entries with their previews and a way to see all', () => {
    const host = render(null, { recent: [entry('a', { title: 'Sunday', body: 'The words' })] });
    const row = host.querySelector('a[app-entry-row]')!;

    expect(row.getAttribute('href')).toBe('/entry/a');
    expect(row.textContent).toContain('The words');
    expect(row.querySelector('app-kind-tag')).toBeNull();
    expect(host.querySelector('section a')!.getAttribute('href')).toBe('/journal');
  });

  it('hides previews when you’ve asked it to', () => {
    const recent = [entry('a', { title: 'Sunday', body: 'The words' })];
    const host = render({ hidePreviews: true }, { recent });
    const row = host.querySelector('a[app-entry-row]')!;

    expect(row.textContent).toContain('Sunday');
    expect(row.textContent).not.toContain('The words');
  });
});

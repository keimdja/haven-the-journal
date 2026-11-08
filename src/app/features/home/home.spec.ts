import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Profile } from '../../core/data/models';
import { ProfileStore } from '../../core/data/profile-store';
import { Home } from './home';

describe('Home', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  function render(profile: Partial<Profile> | null = null) {
    vi.useFakeTimers({ now: new Date(2026, 9, 21, 21, 12), toFake: ['Date'] });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProfileStore, useValue: { profile: signal(profile) } },
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
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Session } from '@supabase/auth-js';

import { routes } from './app.routes';
import { Auth } from './core/auth/auth';
import { EntriesRepo } from './core/data/entries-repo';
import { ProfileStore } from './core/data/profile-store';

describe('routes', () => {
  async function visit(url: string, session: Session | null = {} as Session) {
    const auth = { ready: signal(true), session: signal(session) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: Auth, useValue: auth },
        { provide: ProfileStore, useValue: { profile: signal(null) } },
        // Screens stay on their route: the entry is still "loading" for these tests.
        {
          provide: EntriesRepo,
          useValue: {
            byId: () => new Promise(() => {}),
            all: signal([]),
            loaded: signal(false),
            recent: signal([]),
            newestDraft: signal(undefined),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const root = harness.fixture.nativeElement as HTMLElement;
    return { root, url: TestBed.inject(Router).url };
  }

  it.each([
    ['/', 'app-home'],
    ['/journal', 'app-journal'],
    ['/settings', 'app-settings'],
  ])('%s shows %s inside the shell', async (url, selector) => {
    const { root } = await visit(url);
    expect(root.querySelector(`app-shell main ${selector}`)).not.toBeNull();
  });

  it.each([
    ['/entry/abc', 'app-entry-detail'],
    ['/write/abc', 'app-editor'],
    ['/reflect/abc/2', 'app-reflect-part'],
    ['/reflect/abc/review', 'app-review'],
    ['/login', 'app-login'],
  ])('%s shows %s full-screen', async (url, selector) => {
    const { root } = await visit(url);
    expect(root.querySelector(selector)).not.toBeNull();
    expect(root.querySelector('app-shell')).toBeNull();
  });

  it.each(['/', '/journal', '/write/abc', '/reflect/abc/review'])(
    'sends %s to login when signed out',
    async (url) => {
      expect((await visit(url, null)).url).toBe('/login');
    },
  );

  it('shows login without being signed in', async () => {
    const { root } = await visit('/login', null);
    expect(root.querySelector('app-login')).not.toBeNull();
  });

  it('sends unknown URLs home', async () => {
    expect((await visit('/nowhere')).url).toBe('/');
  });
});

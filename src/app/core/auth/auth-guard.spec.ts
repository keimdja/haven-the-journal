import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Session } from '@supabase/auth-js';

import { Auth } from './auth';
import { authGuard } from './auth-guard';

@Component({ template: '' })
class Blank {}

describe('authGuard', () => {
  function setup(session: Session | null, ready = true) {
    const auth = { ready: signal(ready), session: signal(session) };
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: auth },
        provideRouter([
          { path: 'login', component: Blank },
          { path: '', canActivate: [authGuard], component: Blank },
        ]),
      ],
    });
    return { auth, router: TestBed.inject(Router) };
  }

  it('lets you in when signed in', async () => {
    const { router } = setup({} as Session);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/');
  });

  it('sends you to login when signed out', async () => {
    const { router } = setup(null);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/login');
  });

  it('waits for the saved session before deciding', async () => {
    const { auth, router } = setup(null, false);
    const navigation = router.navigateByUrl('/');

    // The saved session turns up: you're signed in after all.
    auth.session.set({} as Session);
    auth.ready.set(true);
    TestBed.tick();

    await navigation;
    expect(router.url).toBe('/');
  });
});

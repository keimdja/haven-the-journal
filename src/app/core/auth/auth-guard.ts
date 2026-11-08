import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { Auth } from './auth';

/**
 * Lets you in when signed in; otherwise sends you to /login. It waits for the
 * saved session to be read first (`ready`), so a reload never flashes the login
 * screen. It never asks the server (no getUser()), so it works offline.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return toObservable(auth.ready).pipe(
    filter(Boolean),
    take(1),
    map(() => (auth.session() ? true : router.createUrlTree(['/login']))),
  );
};

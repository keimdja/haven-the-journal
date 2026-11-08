import { Routes } from '@angular/router';

/**
 * Only registered in development. The build replaces `ngDevMode` with `false` in
 * production, so this branch and its lazy chunk are removed (isDevMode() can't be).
 */
const devRoutes: Routes = ngDevMode
  ? [
      {
        path: 'styleguide',
        title: 'Styleguide · Haven',
        loadComponent: () => import('./features/styleguide/styleguide').then((m) => m.Styleguide),
      },
    ]
  : [];

export const routes: Routes = [...devRoutes];

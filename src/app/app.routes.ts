import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';

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

/** Every screen loads on demand, so the first visit only downloads what it shows. */
export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · Haven',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  ...devRoutes,

  // Everything else needs you to be signed in; the guard checks each navigation.
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      // The main sections, inside the shell (tab bar on phones, sidebar on desktop).
      {
        path: '',
        loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
        children: [
          {
            path: '',
            pathMatch: 'full',
            title: 'Haven',
            loadComponent: () => import('./features/home/home').then((m) => m.Home),
          },
          {
            path: 'journal',
            title: 'Journal · Haven',
            loadComponent: () => import('./features/journal/journal').then((m) => m.Journal),
          },
          {
            path: 'settings',
            title: 'Settings · Haven',
            loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
          },
        ],
      },

      // Full-screen pages, without the navigation, as in the design.
      {
        path: 'entry/:id',
        title: 'Entry · Haven',
        loadComponent: () => import('./features/entry/entry-detail').then((m) => m.EntryDetail),
      },
      {
        path: 'write/:id',
        title: 'Write · Haven',
        loadComponent: () => import('./features/write/editor').then((m) => m.Editor),
      },
      // Before `reflect/:id/:part`, so "review" isn't read as a part number.
      {
        path: 'reflect/:id/review',
        title: 'Your reflection · Haven',
        loadComponent: () => import('./features/reflect/review/review').then((m) => m.Review),
      },
      {
        path: 'reflect/:id/:part',
        title: 'Reflection · Haven',
        loadComponent: () =>
          import('./features/reflect/reflect-part/reflect-part').then((m) => m.ReflectPart),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];

import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideSyncTriggers } from './core/data/sync-triggers';
import { TranslatedTitles } from './core/i18n/translated-titles';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideSyncTriggers(),
    { provide: TitleStrategy, useClass: TranslatedTitles },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

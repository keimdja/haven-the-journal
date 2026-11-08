import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideSyncTriggers } from './core/data/sync-triggers';
import { TranslatedTitles } from './core/i18n/translated-titles';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideSyncTriggers(),
    { provide: TitleStrategy, useClass: TranslatedTitles },
  ],
};

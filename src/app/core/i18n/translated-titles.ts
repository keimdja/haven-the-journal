import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import type { Copy } from './copy/en';
import { I18n } from './i18n';

/** A route's `title` is the name of its line in the copy, e.g. `title: 'journal'`. */
export type RouteTitle = keyof Copy['titles'];

/**
 * Puts the current screen's name in the browser tab, in the current language,
 * and updates it if the language changes while you're on that screen.
 * A title that isn't in the copy (the dev-only styleguide) is shown as written.
 */
@Injectable()
export class TranslatedTitles extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly t = inject(I18n).t;
  private readonly current = signal<string | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const key = this.current();
      if (key) this.title.setTitle(this.t().titles[key as RouteTitle] ?? key);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.current.set(this.buildTitle(snapshot));
  }
}

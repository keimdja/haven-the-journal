import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { Copy, en } from './copy/en';
import { es } from './copy/es';

export type Lang = 'en' | 'es';

const COPY: Record<Lang, Copy> = { en, es };

/** Locale for dates and numbers. Spanish follows Puerto Rico ("21 de octubre", 12-hour time). */
const LOCALES: Record<Lang, string> = { en: 'en-US', es: 'es-PR' };

const STORAGE_KEY = 'haven.lang';

/**
 * The app's language. Read words with `t()` (`i18n.t().nav.home`), dates with
 * `locale()`, and change it with `setLang()`.
 *
 * The choice is kept on this device so the app opens in it straight away;
 * until there is one, it follows the browser's language. It also sets
 * <html lang> so screen readers pronounce the words correctly.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly storage = this.document.defaultView?.localStorage;

  readonly lang = signal<Lang>(this.initialLang());
  readonly t = computed(() => COPY[this.lang()]);
  readonly locale = computed(() => LOCALES[this.lang()]);

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      try {
        this.storage?.setItem(STORAGE_KEY, lang);
      } catch {
        // Storage can be blocked (private mode); the language still works for this visit.
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  private initialLang(): Lang {
    let saved: string | null | undefined;
    try {
      saved = this.storage?.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    if (saved === 'en' || saved === 'es') return saved;
    return this.document.defaultView?.navigator.language.startsWith('es') ? 'es' : 'en';
  }
}

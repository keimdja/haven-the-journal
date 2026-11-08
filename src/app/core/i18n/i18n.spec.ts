import { TestBed } from '@angular/core/testing';

import { I18n } from './i18n';

describe('I18n', () => {
  // Other specs render the tab bar, whose I18n saves a language; start each test clean.
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function create() {
    const i18n = TestBed.inject(I18n);
    TestBed.tick(); // run the effect that writes <html lang> and storage
    return i18n;
  }

  it('follows the browser language when nothing is saved', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-PR');
    const i18n = create();
    expect(i18n.lang()).toBe('es');
    expect(i18n.t().nav.home).toBe('Inicio');
    expect(i18n.locale()).toBe('es-PR');
  });

  it('uses the saved language over the browser’s', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-PR');
    localStorage.setItem('haven.lang', 'en');
    expect(create().t().nav.home).toBe('Home');
  });

  it('switches language, <html lang> and the saved choice together', () => {
    const i18n = create();
    i18n.setLang('es');
    TestBed.tick();

    expect(i18n.t().settings.signOut).toBe('Cerrar sesión');
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem('haven.lang')).toBe('es');
  });
});

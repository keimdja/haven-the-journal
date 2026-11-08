import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { I18n } from '../../core/i18n/i18n';
import { TabBar } from './tab-bar';

@Component({ template: '' })
class Blank {}

describe('TabBar', () => {
  afterEach(() => localStorage.clear());

  async function at(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Blank },
          { path: 'journal', component: Blank },
          { path: 'settings', component: Blank },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(TabBar);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'));
    const current = links.filter((link) => link.getAttribute('aria-current') === 'page');
    return { links, current };
  }

  it('links to the three sections', async () => {
    const { links } = await at('/');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/journal', '/settings']);
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Home', 'Journal', 'Settings']);
  });

  it('switches its labels with the language', async () => {
    await at('/');
    TestBed.inject(I18n).setLang('es');
    const fixture = TestBed.createComponent(TabBar);
    fixture.detectChanges();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Principal');
    expect(Array.from(nav.querySelectorAll('a')).map((a) => a.textContent?.trim())).toEqual([
      'Inicio',
      'Diario',
      'Ajustes',
    ]);
  });

  it('marks only Home as current on the home page', async () => {
    const { current } = await at('/');
    expect(current.map((link) => link.textContent?.trim())).toEqual(['Home']);
  });

  it('follows the route', async () => {
    const { current } = await at('/journal');
    expect(current.map((link) => link.textContent?.trim())).toEqual(['Journal']);
  });
});

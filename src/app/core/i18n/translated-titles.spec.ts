import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { I18n } from './i18n';
import { TranslatedTitles } from './translated-titles';

@Component({ template: '' })
class Blank {}

describe('TranslatedTitles', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  async function visit(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'journal', title: 'journal', component: Blank },
          { path: 'dev', title: 'Styleguide · Haven', component: Blank },
        ]),
        { provide: TitleStrategy, useClass: TranslatedTitles },
      ],
    });
    await TestBed.inject(Router).navigateByUrl(url);
    TestBed.tick();
    return TestBed.inject(Title);
  }

  it('shows the screen’s name in the current language', async () => {
    expect((await visit('/journal')).getTitle()).toBe('Journal · Haven');
  });

  it('updates when the language changes', async () => {
    const title = await visit('/journal');
    TestBed.inject(I18n).setLang('es');
    TestBed.tick();
    expect(title.getTitle()).toBe('Diario · Haven');
  });

  it('shows a title that isn’t in the copy as written', async () => {
    expect((await visit('/dev')).getTitle()).toBe('Styleguide · Haven');
  });
});

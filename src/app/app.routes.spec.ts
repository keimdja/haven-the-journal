import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('routes', () => {
  async function visit(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return {
      page: harness.routeNativeElement?.tagName.toLowerCase(),
      url: TestBed.inject(Router).url,
    };
  }

  it.each([
    ['/', 'app-home'],
    ['/journal', 'app-journal'],
    ['/entry/abc', 'app-entry-detail'],
    ['/write/abc', 'app-editor'],
    ['/reflect/abc/2', 'app-reflect-part'],
    ['/reflect/abc/review', 'app-review'],
    ['/settings', 'app-settings'],
    ['/login', 'app-login'],
  ])('%s shows %s', async (url, selector) => {
    expect((await visit(url)).page).toBe(selector);
  });

  it('sends unknown URLs home', async () => {
    expect((await visit('/nowhere')).url).toBe('/');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('routes', () => {
  async function visit(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const root = harness.fixture.nativeElement as HTMLElement;
    return { root, url: TestBed.inject(Router).url };
  }

  it.each([
    ['/', 'app-home'],
    ['/journal', 'app-journal'],
    ['/settings', 'app-settings'],
  ])('%s shows %s inside the shell', async (url, selector) => {
    const { root } = await visit(url);
    expect(root.querySelector(`app-shell main ${selector}`)).not.toBeNull();
  });

  it.each([
    ['/entry/abc', 'app-entry-detail'],
    ['/write/abc', 'app-editor'],
    ['/reflect/abc/2', 'app-reflect-part'],
    ['/reflect/abc/review', 'app-review'],
    ['/login', 'app-login'],
  ])('%s shows %s full-screen', async (url, selector) => {
    const { root } = await visit(url);
    expect(root.querySelector(selector)).not.toBeNull();
    expect(root.querySelector('app-shell')).toBeNull();
  });

  it('sends unknown URLs home', async () => {
    expect((await visit('/nowhere')).url).toBe('/');
  });
});

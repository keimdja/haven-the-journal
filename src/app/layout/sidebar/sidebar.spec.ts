import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Sidebar } from './sidebar';

@Component({ template: '' })
class Blank {}

describe('Sidebar', () => {
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
    const fixture = TestBed.createComponent(Sidebar);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('links the brand lockup home and shows the privacy note', async () => {
    const host = await at('/');
    const brand = host.querySelector('a')!;
    expect(brand.getAttribute('href')).toBe('/');
    expect(brand.querySelector('app-brand-mark')!.getAttribute('aria-label')).toBe(
      'Haven, The Journal',
    );
    expect(host.textContent).toContain('Your entries are private to your account.');
  });

  it('marks the current section', async () => {
    const host = await at('/settings');
    const current = Array.from(host.querySelectorAll('nav a')).filter(
      (link) => link.getAttribute('aria-current') === 'page',
    );
    expect(current.map((link) => link.textContent?.trim())).toEqual(['Settings']);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('puts the page in <main> between the sidebar and the tab bar', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const parts = Array.from(host.children).map((child) => child.tagName.toLowerCase());
    expect(parts).toEqual(['app-sidebar', 'main', 'app-tab-bar']);
    expect(host.querySelector('main router-outlet')).not.toBeNull();
    // Only one navigation shows at a time.
    expect(host.querySelector('app-sidebar')!.className).toContain('lg:block');
    expect(host.querySelector('app-tab-bar')!.className).toContain('lg:hidden');
  });
});

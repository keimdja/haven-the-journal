import { TestBed } from '@angular/core/testing';

import { BrandMark } from './brand-mark';

function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(BrandMark);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('BrandMark', () => {
  it('shows the mark and wordmark as one image named Haven', () => {
    const host = render();
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Haven');
    expect(host.querySelector('svg')?.getAttribute('width')).toBe('24');
    expect(host.textContent).toContain('Haven.');
    expect(host.textContent).not.toContain('The Journal');
  });

  it('adds the tagline to the visible text and the name', () => {
    const host = render({ size: 'md', tagline: true });
    expect(host.textContent).toContain('The Journal');
    expect(host.getAttribute('aria-label')).toBe('Haven, The Journal');
    expect(host.querySelector('svg')?.getAttribute('width')).toBe('36');
  });

  it('can show the mark alone', () => {
    const host = render({ wordmark: false, tagline: true });
    expect(host.textContent?.trim()).toBe('');
    expect(host.getAttribute('aria-label')).toBe('Haven');
  });
});

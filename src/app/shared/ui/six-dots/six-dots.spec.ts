import { TestBed } from '@angular/core/testing';

import { SixDots } from './six-dots';

describe('SixDots', () => {
  it('fills the given number of dots and hides itself from screen readers', () => {
    const fixture = TestBed.createComponent(SixDots);
    fixture.componentRef.setInput('filled', 3);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const dots = Array.from(host.querySelectorAll('span'));
    expect(dots).toHaveLength(6);
    expect(dots.filter((dot) => dot.className.includes('bg-olive'))).toHaveLength(3);
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});

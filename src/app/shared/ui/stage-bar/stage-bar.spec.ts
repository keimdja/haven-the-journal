import { TestBed } from '@angular/core/testing';

import { StageBar } from './stage-bar';

describe('StageBar', () => {
  it('marks parts done, current and ahead', () => {
    const fixture = TestBed.createComponent(StageBar);
    fixture.componentRef.setInput('current', 2);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const segments = Array.from(host.querySelectorAll('span')).map((s) => s.className);
    expect(segments).toHaveLength(6);
    expect(segments[0]).toContain('bg-olive');
    expect(segments[1]).toContain('bg-sage');
    expect(segments.slice(2).every((c) => c.includes('bg-divider'))).toBe(true);
  });

  it('is a labelled progress bar', () => {
    const fixture = TestBed.createComponent(StageBar);
    fixture.componentRef.setInput('current', 4);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('progressbar');
    expect(host.getAttribute('aria-valuenow')).toBe('4');
    expect(host.getAttribute('aria-valuemax')).toBe('6');
    expect(host.getAttribute('aria-label')).toBe('Reflection progress');
  });
});

import { TestBed } from '@angular/core/testing';

import { DateStamp } from './date-stamp';

function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(DateStamp);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('DateStamp', () => {
  // Built from local parts so the day can't shift with the test machine's timezone.
  const tuesday = new Date(2026, 9, 20, 20, 40);

  it('shows the day over the short weekday in a <time>', () => {
    const host = render({ date: tuesday });
    const time = host.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2026-10-20');
    expect(time.textContent).toContain('20');
    expect(time.textContent).toContain('Tue');
  });

  it('names the weekday in the given locale', () => {
    const host = render({ date: tuesday, locale: 'es' });
    expect(host.textContent?.toLowerCase()).toContain('mar');
  });
});

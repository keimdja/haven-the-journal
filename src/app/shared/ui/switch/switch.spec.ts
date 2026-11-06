import { TestBed } from '@angular/core/testing';

import { Switch } from './switch';

describe('Switch', () => {
  function setup(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(Switch);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, button };
  }

  it('is an unchecked, named switch by default', () => {
    const { button } = setup({ labelledBy: 'hide-label' });
    expect(button.getAttribute('role')).toBe('switch');
    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(button.getAttribute('aria-labelledby')).toBe('hide-label');
    expect(button.hasAttribute('aria-label')).toBe(false);
  });

  it('turns on when clicked', () => {
    const { fixture, button } = setup({ label: 'Hide previews' });
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.checked()).toBe(true);
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(button.className).toContain('bg-olive');
  });
});

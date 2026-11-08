import { TestBed } from '@angular/core/testing';

import { Chip } from './chip';

function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(Chip);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return { fixture, host: fixture.nativeElement as HTMLElement };
}

describe('Chip', () => {
  it('shows a light tag by default', () => {
    const { host } = render({ label: 'Calm' });
    const tag = host.querySelector('span')!;
    expect(tag.textContent).toContain('Calm');
    expect(tag.className).toContain('bg-sage-tint');
    expect(host.querySelector('button')).toBeNull();
  });

  it('uses clay for heavier feelings', () => {
    const { host } = render({ label: 'Anxious', weight: 'heavy' });
    expect(host.querySelector('span')!.className).toContain('bg-clay-tint');
  });

  it('toggles pressed, with aria-pressed and a check', () => {
    const { fixture, host } = render({ label: 'Hopeful', toggle: true });
    const button = host.querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(host.querySelector('app-icon')).toBeNull();

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.pressed()).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('app-icon')).not.toBeNull();
  });

  it('emits remove from a labelled × button', () => {
    const { fixture, host } = render({ label: 'Embarrassed', removable: true });
    let removed = false;
    fixture.componentInstance.remove.subscribe(() => (removed = true));

    const button = host.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Remove Embarrassed');
    button.click();
    expect(removed).toBe(true);
  });
});

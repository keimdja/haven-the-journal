import { TestBed } from '@angular/core/testing';

import { CheckRow } from './check-row';

function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(CheckRow);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host, checkbox: host.querySelector('input')! };
}

describe('CheckRow', () => {
  it('shows the label and example on a real checkbox', () => {
    const { host, checkbox } = render({
      label: 'Catastrophizing',
      example: '“This is going to go badly.”',
    });
    expect(checkbox.type).toBe('checkbox');
    expect(checkbox.checked).toBe(false);
    expect(host.querySelector('label')!.textContent).toContain('Catastrophizing');
    expect(host.textContent).toContain('This is going to go badly.');
  });

  it('names the checkbox by its label and describes it with the example', () => {
    const { host, checkbox } = render({
      label: 'Reading minds',
      example: '“They must think I’m…”',
    });
    const name = host.querySelector(`#${checkbox.getAttribute('aria-labelledby')}`);
    const description = host.querySelector(`#${checkbox.getAttribute('aria-describedby')}`);
    expect(name?.textContent).toBe('Reading minds');
    expect(description?.textContent?.trim()).toBe('“They must think I’m…”');
  });

  it('checks when the row is clicked', () => {
    const { fixture, host, checkbox } = render({ label: 'Reading minds' });
    host.querySelector('label')!.click();
    fixture.detectChanges();

    expect(checkbox.checked).toBe(true);
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(host.querySelector('app-icon')).not.toBeNull();
  });

  it('reflects a checked value passed in', () => {
    const { checkbox } = render({ label: 'Should statements', checked: true });
    expect(checkbox.checked).toBe(true);
  });
});

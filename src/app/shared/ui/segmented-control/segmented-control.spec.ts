import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SegmentedControl } from './segmented-control';

@Component({
  imports: [SegmentedControl],
  template: `<app-segmented-control label="Language" [options]="options" [(value)]="lang" />`,
})
class Host {
  readonly options = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ] as const;
  readonly lang = signal<'en' | 'es'>('en');
}

describe('SegmentedControl', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    return { fixture, root, radios };
  }

  it('renders a named radio group with the current value checked', () => {
    const { root, radios } = setup();
    expect(root.querySelector('[role="radiogroup"]')!.getAttribute('aria-label')).toBe('Language');
    expect(radios.map((radio) => radio.checked)).toEqual([true, false]);
    expect(radios[0].name).toBe(radios[1].name);
  });

  it('updates the bound value when another segment is picked', () => {
    const { fixture, root, radios } = setup();
    root.querySelectorAll('label')[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.lang()).toBe('es');
    expect(radios[1].checked).toBe(true);
  });
});

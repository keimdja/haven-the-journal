import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Button } from './button';

@Component({
  imports: [Button],
  template: `
    <button appButton id="primary">Continue</button>
    <button appButton="danger" type="submit" [wide]="true" id="danger">Delete</button>
    <a appButton="quiet" class="mt-4" href="/" id="link">Back</a>
  `,
})
class Host {}

describe('Button', () => {
  function query(id: string) {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!;
  }

  it('is primary and type="button" by default', () => {
    const button = query('primary');
    expect(button.className).toContain('bg-olive');
    expect(button.className).toContain('h-12');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('applies the variant, the wide size and the given type', () => {
    const button = query('danger');
    expect(button.className).toContain('bg-error');
    expect(button.className).toContain('w-full');
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('styles links without a type and keeps their own classes', () => {
    const link = query('link');
    expect(link.className).toContain('hover:bg-cream');
    expect(link.className).toContain('mt-4');
    expect(link.hasAttribute('type')).toBe(false);
  });
});

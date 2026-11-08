import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TextField, TextFieldInput } from './text-field';

@Component({
  imports: [TextField, TextFieldInput],
  template: `
    <app-text-field label="Email" [error]="error()">
      <input appInput type="email" />
    </app-text-field>
    <app-text-field label="Search your entries" variant="search">
      <input appInput type="search" />
    </app-text-field>
  `,
})
class Host {
  readonly error = signal<string | null>(null);
}

describe('TextField', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const [email, search] = Array.from(root.querySelectorAll('app-text-field'));
    return { fixture, email, search };
  }

  it('links the label to its input', () => {
    const { email } = setup();
    const label = email.querySelector('label')!;
    const input = email.querySelector('input')!;
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
    expect(input.className).toContain('rounded-control');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('shows the error and marks the input invalid', () => {
    const { fixture, email } = setup();
    fixture.componentInstance.error.set('That email looks incomplete.');
    fixture.detectChanges();

    const input = email.querySelector('input')!;
    const message = email.querySelector('p')!;
    expect(message.textContent).toContain('That email looks incomplete.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
    expect(input.className).toContain('border-error');
  });

  it('gives each field its own id', () => {
    const { email, search } = setup();
    expect(email.querySelector('input')!.id).not.toBe(search.querySelector('input')!.id);
  });

  it('hides the search label visually and adds the icon', () => {
    const { search } = setup();
    expect(search.querySelector('label')!.className).toContain('sr-only');
    expect(search.querySelector('app-icon')).not.toBeNull();
    expect(search.querySelector('input')!.className).toContain('pl-10.5');
  });
});

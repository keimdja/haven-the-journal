import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Session } from '@supabase/auth-js';

import { Auth } from '../../core/auth/auth';
import { Login } from './login';

describe('Login', () => {
  function setup() {
    const auth = { session: signal<Session | null>(null), signIn: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: auth }],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const [email, password] = Array.from(host.querySelectorAll('input'));

    const type = (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges(); // as after a real keystroke
    };
    const submit = async () => {
      host.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const alert = () => host.querySelector('[role="alert"]')?.textContent?.trim();
    return { auth, router, fixture, host, email, password, type, submit, alert };
  }

  it('shows email and password fields and a Continue button', () => {
    const { host, email, password } = setup();
    expect(email.type).toBe('email');
    expect(email.autocomplete).toBe('email');
    expect(password.type).toBe('password');
    expect(password.autocomplete).toBe('current-password');
    expect(host.querySelector('button[type="submit"]')!.textContent).toContain('Continue');
    expect(host.querySelector('a')).toBeNull(); // no sign-up link
  });

  it('asks for both fields before trying', async () => {
    const { auth, email, type, submit, alert } = setup();
    type(email, 'k@example.com');
    await submit();

    expect(alert()).toBe('Enter your email and password.');
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('goes Home after signing in', async () => {
    const { auth, router, email, password, type, submit } = setup();
    auth.signIn.mockResolvedValue('ok');
    type(email, 'k@example.com');
    type(password, 'secret');
    await submit();

    expect(auth.signIn).toHaveBeenCalledWith('k@example.com', 'secret');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('says when the details are wrong, and clears the password', async () => {
    const { auth, router, email, password, type, submit, alert } = setup();
    auth.signIn.mockResolvedValue('wrong-details');
    type(email, 'k@example.com');
    type(password, 'wrong');
    await submit();

    expect(alert()).toBe('That email and password don’t match.');
    expect(password.value).toBe('');
    expect(email.value).toBe('k@example.com');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('says when Haven can’t be reached', async () => {
    const { auth, email, password, type, submit, alert } = setup();
    auth.signIn.mockResolvedValue('failed');
    type(email, 'k@example.com');
    type(password, 'secret');
    await submit();

    expect(alert()).toContain('Couldn’t reach Haven');
  });
});

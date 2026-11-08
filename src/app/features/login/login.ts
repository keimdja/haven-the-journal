import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { Auth, SignInResult } from '../../core/auth/auth';
import { I18n } from '../../core/i18n/i18n';
import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { Button } from '../../shared/ui/button/button';
import { TextField, TextFieldInput } from '../../shared/ui/text-field/text-field';

type LoginError = Exclude<SignInResult, 'ok'> | 'missing';

/** Which line of the login copy explains each problem. */
const ERROR_COPY = {
  missing: 'missing',
  'wrong-details': 'wrongDetails',
  failed: 'failed',
} as const satisfies Record<LoginError, string>;

/**
 * Email and password, nothing else: no sign-up, no reset (accounts are managed
 * in the Supabase dashboard). Signed in, it takes you Home.
 */
@Component({
  selector: 'app-login',
  imports: [BrandMark, Button, TextField, TextFieldInput],
  templateUrl: './login.html',
  host: { class: 'flex min-h-dvh items-center justify-center px-6 py-12' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly t = inject(I18n).t;

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<LoginError | null>(null);

  protected readonly errorText = computed(() => {
    const error = this.error();
    return error ? this.t().login[ERROR_COPY[error]] : null;
  });

  constructor() {
    // Already signed in (another tab, or the back button): go straight Home.
    effect(() => {
      if (this.auth.session()) void this.router.navigateByUrl('/');
    });
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting()) return;
    if (!this.email().trim() || !this.password()) {
      this.error.set('missing');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const result = await this.auth.signIn(this.email(), this.password());
    this.submitting.set(false);

    if (result === 'ok') {
      await this.router.navigateByUrl('/');
    } else {
      this.error.set(result);
      // Keep the email; clear the password so the next attempt starts fresh.
      if (result === 'wrong-details') this.password.set('');
    }
  }
}

import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/auth-js';

import { SUPABASE } from './supabase';

/** How a sign-in attempt went, so the login screen can say the right thing. */
export type SignInResult = 'ok' | 'wrong-details' | 'failed';

/**
 * Who is signed in. `session` follows Supabase's auth events; `ready` turns true
 * once the saved session has been read on start, so nothing decides "signed out"
 * too early.
 *
 * The session is read from local storage, not checked with the server, so the
 * app opens while offline. Row-level security still checks every request.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly supabase = inject(SUPABASE);

  private readonly currentSession = signal<Session | null>(null);
  private readonly loaded = signal(false);

  readonly session = this.currentSession.asReadonly();
  readonly ready = this.loaded.asReadonly();
  readonly user = computed(() => this.currentSession()?.user ?? null);

  constructor() {
    // Fires straight away with the saved session (INITIAL_SESSION), then on every
    // sign-in, sign-out and token refresh.
    const { data } = this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentSession.set(session);
      this.loaded.set(true);
    });
    inject(DestroyRef).onDestroy(() => data.subscription.unsubscribe());
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (!error) return 'ok';
    return error.code === 'invalid_credentials' ? 'wrong-details' : 'failed';
  }

  /** Ends the session. Clearing this device's journal comes with safe sign-out. */
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}

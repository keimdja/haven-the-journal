import { TestBed } from '@angular/core/testing';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { Auth } from './auth';
import { SUPABASE } from './supabase';

type Listener = (event: AuthChangeEvent, session: Session | null) => void;

/** Just enough of the Supabase client for Auth: auth events and sign-in/out. */
function fakeSupabase() {
  let listener: Listener = () => {};
  const auth = {
    onAuthStateChange: vi.fn((callback: Listener) => {
      listener = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  return {
    client: { auth },
    emit: (event: AuthChangeEvent, s: Session | null) => listener(event, s),
  };
}

const session = { user: { id: 'user-1', email: 'k@example.com' } } as Session;

describe('Auth', () => {
  function setup() {
    const supabase = fakeSupabase();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE, useValue: supabase.client }],
    });
    return { auth: TestBed.inject(Auth), ...supabase };
  }

  it('is not ready until the saved session has been read', () => {
    const { auth, emit } = setup();
    expect(auth.ready()).toBe(false);

    emit('INITIAL_SESSION', null);
    expect(auth.ready()).toBe(true);
    expect(auth.session()).toBeNull();
  });

  it('follows sign-in and sign-out events', () => {
    const { auth, emit } = setup();
    emit('INITIAL_SESSION', session);
    expect(auth.user()?.email).toBe('k@example.com');

    emit('SIGNED_OUT', null);
    expect(auth.user()).toBeNull();
  });

  it('signs in with a trimmed email', async () => {
    const { auth, client } = setup();
    client.auth.signInWithPassword.mockResolvedValue({ error: null });

    expect(await auth.signIn('  k@example.com ', 'secret')).toBe('ok');
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'k@example.com',
      password: 'secret',
    });
  });

  it('tells wrong details apart from other failures', async () => {
    const { auth, client } = setup();
    client.auth.signInWithPassword.mockResolvedValueOnce({
      error: { code: 'invalid_credentials' },
    });
    expect(await auth.signIn('k@example.com', 'wrong')).toBe('wrong-details');

    client.auth.signInWithPassword.mockResolvedValueOnce({ error: { code: undefined } });
    expect(await auth.signIn('k@example.com', 'secret')).toBe('failed');
  });

  it('signs out', async () => {
    const { auth, client } = setup();
    await auth.signOut();
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});

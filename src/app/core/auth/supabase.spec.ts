import { TestBed } from '@angular/core/testing';

import { SUPABASE } from './supabase';

describe('SUPABASE', () => {
  it('is one shared connection with auth and the tables', () => {
    const supabase = TestBed.inject(SUPABASE);
    expect(supabase).toBe(TestBed.inject(SUPABASE));
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.db.from).toBe('function');
  });

  it('sends the publishable key, and a bearer token, with table requests', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('[]', { status: 200 }));

    await TestBed.inject(SUPABASE).db.from('entries').select('id');

    const [, init] = fetchSpy.mock.calls.at(-1)!;
    const headers = new Headers(init?.headers);
    expect(headers.get('apikey')).toMatch(/^sb_publishable_/);
    // Signed out, the token is the publishable key; signed in, your access token.
    expect(headers.get('Authorization')).toMatch(/^Bearer /);
    fetchSpy.mockRestore();
  });
});

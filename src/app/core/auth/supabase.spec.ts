import { TestBed } from '@angular/core/testing';

import { SUPABASE } from './supabase';

describe('SUPABASE', () => {
  it('is one shared client for the whole app', () => {
    const client = TestBed.inject(SUPABASE);
    expect(client).toBe(TestBed.inject(SUPABASE));
    expect(typeof client.from).toBe('function');
    expect(typeof client.auth.signInWithPassword).toBe('function');
  });
});

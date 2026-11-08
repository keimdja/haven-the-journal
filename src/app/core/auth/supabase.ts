import { InjectionToken } from '@angular/core';
import { GoTrueClient } from '@supabase/auth-js';
import { PostgrestClient } from '@supabase/postgrest-js';

import { environment } from '../../../environments/environment';

/**
 * Haven's connection to Supabase: just the two parts it uses.
 *
 * - `auth`: sign in, sign out and the session (Supabase Auth).
 * - `db`: the tables (`db.from('entries')…`, Supabase's REST API).
 *
 * Built from Supabase's own smaller packages rather than `createClient`, which
 * would also bundle Realtime, Storage and Edge Functions that Haven never uses.
 */
export interface Supabase {
  readonly auth: GoTrueClient;
  readonly db: PostgrestClient;
}

/** Signed-in requests carry your access token, so row-level security knows it's you. */
function withAccessToken(auth: GoTrueClient, key: string): typeof fetch {
  return async (input, init) => {
    const { data } = await auth.getSession();
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${data.session?.access_token ?? key}`);
    return fetch(input, { ...init, headers });
  };
}

function createSupabase(): Supabase {
  const { supabaseUrl: url, supabaseKey: key } = environment;
  const auth = new GoTrueClient({
    url: `${url}/auth/v1`,
    headers: { apikey: key },
    // The session is kept in local storage and refreshed automatically, so you
    // stay signed in across reloads and while offline.
    storageKey: 'haven.auth',
    persistSession: true,
    autoRefreshToken: true,
    // Email + password only; there are no magic-link redirects to read from the URL.
    detectSessionInUrl: false,
  });
  const db = new PostgrestClient(`${url}/rest/v1`, {
    headers: { apikey: key },
    fetch: withAccessToken(auth, key),
  });
  return { auth, db };
}

/**
 * The one Supabase connection for the whole app (`inject(SUPABASE)`). Only auth
 * and sync use it, never screens. Specs can provide a fake instead.
 */
export const SUPABASE = new InjectionToken<Supabase>('SUPABASE', {
  providedIn: 'root',
  factory: createSupabase,
});

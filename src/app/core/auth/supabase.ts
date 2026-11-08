import { InjectionToken } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

/**
 * The one Supabase client for the whole app. Inject it with
 * `inject(SUPABASE)`; only auth and sync use it, never screens.
 *
 * The session is kept in local storage and refreshed automatically, so you stay
 * signed in across reloads and while offline. Specs can provide a fake instead.
 */
export const SUPABASE = new InjectionToken<SupabaseClient>('SUPABASE', {
  providedIn: 'root',
  factory: () =>
    createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Email + password only; there are no magic-link redirects to read from the URL.
        detectSessionInUrl: false,
      },
    }),
});

/**
 * Production settings (ng build). The development build swaps in
 * environment.development.ts instead.
 *
 * The Supabase key here is the *publishable* key: it's meant to ship in the
 * app and is safe to commit. What protects your data is row-level security in
 * supabase/002_security.sql. Never put the secret / service-role key in this app.
 */
export const environment = {
  production: true,
  supabaseUrl: 'https://ooqkiwipupdwaoiqorpa.supabase.co',
  supabaseKey: 'sb_publishable_7vGjzIsfIILgdnEQCShbCA_9awNq7Ug',
};

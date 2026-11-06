-- Haven backend checks. Changes nothing permanently: the last step deletes the test row.
-- Run ONE step at a time in the Supabase SQL editor (select the statement, then "Run selected").
-- The editor runs as the database owner, which skips row-level security, so the test
-- row names your user explicitly instead of relying on auth.uid().

-- 1. Insert a test entry.
--    Expect: one row back, with updated_at filled in by the server.
insert into public.entries (id, user_id, kind, title, written_at, client_updated_at)
values (
  '00000000-0000-4000-8000-000000000001',
  (select id from auth.users limit 1),
  'free', 'Test entry', now(), '2026-01-01 10:00+00'
)
returning id, title, client_updated_at, updated_at;

-- 2. Send an OLDER edit (09:00 < 10:00).
--    Expect: no rows back. The stale-write trigger skipped it.
update public.entries
set title = 'Stale edit', client_updated_at = '2026-01-01 09:00+00'
where id = '00000000-0000-4000-8000-000000000001'
returning id, title;

-- 3. Confirm the row is unchanged.
--    Expect: title is still 'Test entry', client_updated_at still 10:00.
select title, client_updated_at, updated_at
from public.entries
where id = '00000000-0000-4000-8000-000000000001';

-- 4. Send a NEWER edit (11:00 > 10:00).
--    Expect: one row back, title 'Newer edit', updated_at later than in step 1.
update public.entries
set title = 'Newer edit', client_updated_at = '2026-01-01 11:00+00'
where id = '00000000-0000-4000-8000-000000000001'
returning id, title, client_updated_at, updated_at;

-- 5. Try a thinking pattern that isn't on the list.
--    Expect: ERROR, violates check constraint "entries_patterns_check".
update public.entries
set patterns = array['not_a_pattern'], client_updated_at = '2026-01-01 12:00+00'
where id = '00000000-0000-4000-8000-000000000001';

-- 6. Try a preset feeling that isn't on the list.
--    Expect: ERROR, violates check constraint "entries_feelings_check".
update public.entries
set feelings = array['Relieved, later'], client_updated_at = '2026-01-01 12:00+00'
where id = '00000000-0000-4000-8000-000000000001';

-- 7. A typed feeling goes in custom_feelings instead.
--    Expect: one row back with custom_feelings = {"Relieved, later"}.
update public.entries
set custom_feelings = array['Relieved, later'], client_updated_at = '2026-01-01 12:00+00'
where id = '00000000-0000-4000-8000-000000000001'
returning id, custom_feelings;

-- 8. Clean up.
--    Expect: one row deleted; the entries table is empty again.
delete from public.entries
where id = '00000000-0000-4000-8000-000000000001'
returning id;

-- 9. From your terminal (not the SQL editor): an anonymous request sees nothing.
--    Run it while the test row still exists (any time between steps 1 and 8);
--    on an empty table, [] proves nothing.
--    Replace the URL and key with your project URL and public (anon / publishable) key.
--    Expect: [] even though the row is there.
--
--    curl -s "https://YOUR-PROJECT.supabase.co/rest/v1/entries?select=id&limit=1" \
--      -H "apikey: YOUR-PUBLIC-KEY"

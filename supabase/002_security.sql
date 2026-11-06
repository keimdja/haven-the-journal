-- Haven security: every row belongs to one account, and only that account
-- can see or change it. Anonymous requests (public key, no login) get no
-- policies at all, so they see nothing.
-- Run once in the Supabase SQL editor, after 001_schema.sql.

alter table public.profiles enable row level security;
alter table public.entries  enable row level security;

-- profiles: you can read and edit only your own row
create policy "profile read"   on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profile update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- entries: full control over your own rows only.
-- Sync uses upsert, which needs both the insert and the update policy.
create policy "entries read"   on public.entries for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "entries insert" on public.entries for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "entries update" on public.entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "entries delete" on public.entries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Create the profile row automatically for each new auth user.
-- security definer: it runs as the owner, because the auth service that
-- inserts users has no rights on public.profiles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- Only the trigger should run it; nobody can call it directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Your user was created by hand before this trigger existed.
insert into public.profiles (id) select id from auth.users
on conflict (id) do nothing;

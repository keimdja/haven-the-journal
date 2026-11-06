-- Haven schema: one profile row per user, and every journal entry
-- (free writing and reflections) in a single `entries` table.
-- Run once in the Supabase SQL editor. Row-level security is in 002_security.sql.

-- Keeps updated_at in server time on every write (the sync cursor).
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Last edit wins, decided on the server: an update carrying an older
-- device edit time than the stored row is silently skipped.
create or replace function public.reject_stale_write()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.client_updated_at < old.client_updated_at then
    return null;
  end if;
  return new;
end;
$$;

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '',
  language      text not null default 'en' check (language in ('en', 'es')),
  hide_previews boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.entries (
  id                uuid primary key,                 -- made on the device
  user_id           uuid not null default auth.uid()
                    references auth.users(id) on delete cascade,
  kind              text not null check (kind in ('free', 'reflection')),
  title             text,
  body              text,                             -- free writing
  what_happened     text,                             -- part 1
  thoughts          text,                             -- part 2
  feelings          text[] not null default '{}'      -- part 3 + free writing: preset chips
                    check (feelings <@ array[
                      'calm', 'content', 'grateful', 'hopeful', 'tender', 'relieved', 'proud',
                      'tired', 'restless', 'unsure', 'anxious', 'sad', 'frustrated', 'lonely'
                    ]::text[]),
  custom_feelings   text[] not null default '{}'      -- feelings you typed yourself
                    check (array_length(custom_feelings, 1) is null
                           or array_length(custom_feelings, 1) <= 20),
  feelings_note     text,                             -- part 3 text
  patterns          text[] not null default '{}'      -- part 4
                    check (patterns <@ array[
                      'minimize_magnify', 'predicting_future', 'reading_minds',
                      'catastrophizing', 'extreme_thinking', 'jumping_to_conclusions',
                      'blaming_myself', 'blaming_others', 'not_questioning',
                      'feelings_as_facts', 'should_statements'
                    ]::text[]),
  reframe           text,                             -- part 5
  gratitude         text,                             -- part 6
  status            text not null default 'draft' check (status in ('draft', 'complete')),
  current_step      smallint check (current_step between 1 and 6),
  written_at        timestamptz not null,             -- the entry's date in the UI
  client_updated_at timestamptz not null,             -- last edit time on the device
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz                       -- set on delete; the row stays so other devices learn about it
);

-- Each device pulls "my rows changed since X", so index exactly that.
create index entries_sync_idx on public.entries (user_id, updated_at);

-- Triggers on the same table fire in name order: the stale check runs first.
create trigger entries_reject_stale before update on public.entries
  for each row execute function public.reject_stale_write();
create trigger entries_updated_at before insert or update on public.entries
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before insert or update on public.profiles
  for each row execute function public.set_updated_at();

# Haven — Build Guide

Revised Oct 31, 2026 · @K

## Overview

Haven is a local-first **Angular PWA**: installable on phone and desktop, opens offline, and every screen reads and writes a local IndexedDB database. A small sync service copies changes to and from Supabase in the background. The app never waits on the network, so it works offline and survives the free project's 7-day pause.

Decisions already made:

- **Single user (you).** Signups are turned off; you created your own account by hand.
- **No end-to-end encryption.** Entries are protected by HTTPS, encryption at rest and row-level security. The sidebar copy reads "Your entries are private to your account."
- **Supabase free plan.** 500 MB database is decades of text entries for one person.
- **Search, export and filtering run on the device**, against the local copy. The server only stores and syncs.
- **Hosting on GitHub Pages**, same as the RSVP app.

Starting point: the Angular 21 project `haven-the-journal` is already scaffolded (standalone, zoneless, plain CSS + Tailwind 4, Vitest). Step 1 is done. Steps 2–5 finish and verify the backend before any feature code exists, so the frontend is built against a finished contract. Steps 6–13 build the app. Each step ends in something you can check.

```text
 Device                                            Cloud
┌───────────────────────────────────────────┐     ┌──────────────────────┐
│ Screens → entries repo → Dexie (IndexedDB) │     │ Supabase             │
│                              ↕ sync        │ ⇄  │  Auth · Postgres+RLS │
│ Service worker: app shell + fonts offline  │     └──────────────────────┘
└───────────────────────────────────────────┘
```

The local database is what the app reads; Supabase is the backup and the copy that lets a second device catch up. Browsers can clear local storage, so nothing counts as safe until it has synced.

## Part 1 — Backend

### Step 1. Create the project and lock it to you ✅ Done

Confirm before moving on:

- [ ] Project `haven` exists on the free plan in a US East region; the database password is in your password manager.
- [ ] Email is the only provider and **"Allow new users to sign up" is off**.
- [ ] The Users list shows exactly one user (you), marked confirmed.
- [ ] You have the **project URL** and the **public key** (anon / publishable). The service role / secret key never goes in the app.

### Step 2. Design the data model from the screens

Two tables cover every screen: `profiles` (one row, your settings) and `entries` (free writing and reflections in one table, told apart by `kind`). One table keeps the Journal list, "All" tab, search and month grouping to a single query.

| Screen / element | Column(s) | Notes |
| --- | --- | --- |
| Journal tabs: All · Free writing · Reflections | `kind` = `free` \| `reflection` | Tag above each title comes from this |
| Entry title, optional | `title` | Null → list shows the opening line in italics, like "Couldn't sleep…" |
| Write freely page | `body` | Free writing only |
| Reflection parts 1, 2, 5, 6 | `what_happened`, `thoughts`, `reframe`, `gratitude` | Null = skipped ("Skipped for now" on Review) |
| Part 3 chips + text | `feelings` (text array), `feelings_note` | Free writing also uses `feelings` (Calm, Content) |
| Part 4 thinking patterns | `patterns` (text array of 6 fixed keys) | Checked against the allowed keys |
| "Draft · 3 of 6", six dots, Pick up where you left off | `status` = `draft` \| `complete`, `current_step` 1–6 | Home shows the newest draft reflection |
| Date and time on entries, "20 TUE", month groups | `written_at` | Set once, when the entry starts |
| Saved / Saving / Offline / Couldn't save | `client_updated_at`, `updated_at` | Device edit time vs server time; see step 10 |
| Delete entry, delete sheet | `deleted_at` | Tombstone: text is wiped, the row stays so other devices learn about it |
| Settings: Name, Language, Hide previews | `profiles.display_name`, `language`, `hide_previews` | Email and password live in Supabase Auth |

Store feelings and patterns as **keys** (`anxious`, `reading_minds`), never as display words. The app translates keys to English or Spanish and picks the chip colour (clay tint for heavier feelings, sage tint for lighter), so changing language never touches stored data.

Entry ids are made **on the device** with `crypto.randomUUID()`, so an entry written offline already has its final id before it ever reaches the server.

### Step 3. Create the tables

Run this in the SQL editor. Save it in the repo as `supabase/001_schema.sql` so the schema lives next to the code.

```sql
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
  feelings          text[] not null default '{}',     -- part 3 chips + free writing chips
  feelings_note     text,                             -- part 3 text
  patterns          text[] not null default '{}'      -- part 4
                    check (patterns <@ array[
                      'expecting_worst', 'all_or_nothing', 'reading_minds',
                      'hard_on_myself', 'always_never', 'feelings_as_facts'
                    ]::text[]),
  reframe           text,                             -- part 5
  gratitude         text,                             -- part 6
  status            text not null default 'draft' check (status in ('draft', 'complete')),
  current_step      smallint check (current_step between 1 and 6),
  written_at        timestamptz not null,             -- the entry's date in the UI
  client_updated_at timestamptz not null,             -- last edit time on the device
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index entries_sync_idx on public.entries (user_id, updated_at);

-- Triggers on the same table fire in name order: the stale check runs first.
create trigger entries_reject_stale before update on public.entries
  for each row execute function public.reject_stale_write();
create trigger entries_updated_at before insert or update on public.entries
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before insert or update on public.profiles
  for each row execute function public.set_updated_at();
```

Two timestamps on purpose: `client_updated_at` decides which version wins when two devices edit the same entry, and the `reject_stale_write` trigger enforces that on the server, so a device that comes back online with an old edit can't overwrite a newer one. `updated_at` is set by the server and tells each device what changed since its last pull, so device clocks never matter for that.

### Step 4. Lock rows to their owner

Row-level security is what makes "private to your account" true. Without it, anyone holding the public key could read every row. Save as `supabase/002_security.sql`.

```sql
alter table public.profiles enable row level security;
alter table public.entries  enable row level security;

-- profiles: you can read and edit only your own row
create policy "profile read"   on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profile update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- entries: full control over your own rows only
create policy "entries read"   on public.entries for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "entries insert" on public.entries for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "entries update" on public.entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "entries delete" on public.entries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- create the profile row automatically for each new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- you created your user in step 1, before this trigger existed:
insert into public.profiles (id) select id from auth.users
on conflict (id) do nothing;
```

The sync in step 10 uses upsert, which needs both the insert and update policies; that's why both exist. The app never hard-deletes (it writes tombstones), but the delete policy lets you purge old tombstones later. Leave anonymous access with no policies at all.

### Step 5. Keep it awake and verify

**Keepalive (optional).** Normal syncing keeps the project awake if you journal weekly. For weeks off, add `.github/workflows/keepalive.yml` and put the URL and public key in repository secrets:

```yaml
name: Supabase keepalive
on:
  schedule:
    - cron: '17 13 */3 * *'   # every 3 days
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sf "${{ secrets.SUPABASE_URL }}/rest/v1/entries?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"
```

The request returns an empty list (no login, so security hides every row) but still reaches the database. After the first week, confirm in the dashboard that the project hasn't been flagged as inactive. GitHub turns off scheduled workflows in public repos after about 60 days without commits, so check it now and then.

**Verify the backend** before writing feature code:

- [ ] In the SQL editor, insert a test entry with your user id, then confirm it appears and `updated_at` was filled in.
- [ ] Update it with a `client_updated_at` **older** than the stored one: the row stays unchanged. Update it with a newer one: the change lands and `updated_at` moves forward.
- [ ] Run the keepalive curl from your terminal: it returns `[]`, proving anonymous requests see nothing.
- [ ] Try inserting a pattern key that isn't in the list: the check constraint rejects it.
- [ ] Delete the test entry.
- [ ] Database → Advisors shows no security warnings for these tables and functions.

## Part 2 — Frontend

### Step 6. Make the project a PWA and add the foundations

The project is already scaffolded, so don't run `ng new`. From the repo root:

```bash
ng add @angular/pwa
npm install @supabase/supabase-js dexie
ng generate environments
```

`ng add @angular/pwa` does the PWA groundwork:

- adds `@angular/service-worker` and registers it in `src/app/app.config.ts` with `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), … })`
- creates `ngsw-config.json`, `public/manifest.webmanifest` and placeholder icons in `public/icons/`
- links the manifest and adds `theme-color` in `src/index.html`

Runtime dependencies are now three: the Angular service worker, the Supabase client and Dexie. Everything else (translations, dates, search, export) uses what's built into Angular and the browser. Tailwind is build-time only.

The service worker is **off under `ng serve`** (`enabled: !isDevMode()`). To test offline and install behaviour locally, use a production build:

```bash
ng build && npx http-server dist/haven-the-journal/browser -p 8080 -c-1
```

Then open `http://localhost:8080`. Browsers allow service workers on localhost without HTTPS.

Put the URL and public key in `src/environments/environment.ts` and `environment.development.ts`. The public key is safe in frontend code; security comes from step 4.

Suggested structure (Angular 21 naming: no `.service` suffix):

```text
src/app/
  core/
    supabase.ts        # one shared client
    auth.ts            # session signal + guard (step 11)
    local-db.ts        # Dexie database (step 9)
    entries-repo.ts    # all reads/writes the screens use
    sync.ts            # push/pull + save status (step 10)
    i18n.ts            # English/Spanish copy (step 8)
    copy/en.ts  copy/es.ts
    pwa.ts             # update prompt + persistent storage (step 13)
    models.ts          # Entry, Profile, FeelingKey, PatternKey
  shared/ui/           # button, chip, stage-bar, six-dots, bottom-sheet
  features/
    login/  home/  journal/  entry-detail/
    write/  reflection/  settings/
  layout/              # mobile tab bar + desktop sidebar shell
```

Rule that keeps the code clean: **screens only talk to `entries-repo.ts`**, never to Dexie or Supabase directly.

Check: `ng build` succeeds, and the served build shows a registered service worker in DevTools → Application → Service workers.

### Step 7. Turn the design foundations into tokens

Tailwind 4 is already wired in (`src/styles.css` imports it). Its `@theme` block turns each token into both a CSS custom property and a utility class, so components use names, never hex codes. Create `src/tokens.css` and import it from `src/styles.css` right after `@import 'tailwindcss';`:

```css
@theme {
  /* surfaces */
  --color-ivory: #F7F4ED;  --color-paper: #FBF9F4;  --color-cream: #F0EBE1;
  --color-hairline: #E3DDD1;  --color-taupe-line: #CFC6B6;
  /* text */
  --color-ink: #383831;  --color-ink-soft: #66655E;  --color-placeholder: #8F8B81;
  /* action + meaning */
  --color-olive: #59664F;  --color-olive-deep: #4A5542;  --color-sage: #899780;  --color-sage-tint: #E6E9DF;
  --color-clay: #C58F7A;  --color-clay-tint: #F1E4DE;  --color-clay-text: #7A4634;
  --color-lavender: #DCD7E1;  --color-lavender-text: #5E5868;
  --color-error: #A2483A;  --color-error-tint: #F4E2DC;
  /* type */
  --font-reflect: 'Fraunces', Georgia, serif;
  --font-ui: 'DM Sans', system-ui, sans-serif;
  --text-display: 48px;   --text-display--line-height: 1.08;
  --text-question: 30px;  --text-question--line-height: 1.15;
  --text-writing: 18px;   --text-writing--line-height: 1.72;
  --text-prompt: 15px;
  --text-ui: 15px;        --text-ui--line-height: 1.5;
  --text-label: 12px;     --text-label--letter-spacing: 0.08em;
  /* radius 6·10·14·20 */
  --radius-chip: 6px; --radius-control: 10px; --radius-page: 14px; --radius-sheet: 20px;
}
```

That gives you `bg-ivory`, `text-ink`, `font-reflect`, `text-writing`, `rounded-sheet` and so on. Tailwind's default spacing step is 4px, which already matches the 4·8·12·16·24·32·48·64 scale (`p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`), so spacing needs no tokens. Entry titles (18–21) use `text-lg`/`text-xl` with `font-reflect`.

- **Fonts:** download Fraunces and DM Sans as `.woff2` into `public/fonts/` and declare them with `@font-face` in `src/styles.css`. Self-hosting means the service worker caches them (step 13), so the app looks right offline. No Google Fonts link.
- **Shared components** to build first, each matching the Components & States sheet: primary / secondary / quiet button (48–50 px tall, olive focus ring), input with focus and error states, feeling chip (heavy = clay tint, light = sage tint), checkbox row, segmented control (English / Español), stage bar (done · current · ahead), six-dot progress, bottom sheet, save-status line.

Check: a throwaway `/styleguide` route showing every component in every state matches the sheet side by side.

### Step 8. Bilingual copy, switchable at runtime

Angular's built-in i18n builds a separate app per language, which doesn't fit the Settings toggle that switches instantly. A small signal-based service does, with no library:

```ts
// core/copy/en.ts — written in English, not translated
export const en = {
  greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
  homeSub: "What's on your mind today? You can start anywhere.",
  writeFreely: 'Write freely',
  feelings: { anxious: 'Anxious', calm: 'Calm', content: 'Content' /* … */ },
  patterns: { reading_minds: { name: 'Reading minds', example: '"They must think I\'m…"' } /* … */ },
};
// No `as const`: Copy must say "every value is a string", not "every value is this English string".
export type Copy = typeof en;

// core/copy/es.ts — written in Spanish, same shape (TypeScript enforces it)
export const es: Copy = { /* "Buenas noches", "Escribir libremente", … */ };

// core/i18n.ts
const readStoredLang = () => (localStorage.getItem('haven.lang') === 'es' ? 'es' : 'en');

@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<'en' | 'es'>(readStoredLang());
  readonly t = computed(() => (this.lang() === 'en' ? en : es));
  readonly locale = computed(() => (this.lang() === 'en' ? 'en-US' : 'es-PR'));

  constructor() {
    effect(() => {
      document.documentElement.lang = this.lang();
      localStorage.setItem('haven.lang', this.lang());
    });
  }
}
```

- Templates read `i18n.t().writeFreely`; switching language re-renders everything.
- Dates use `Intl.DateTimeFormat(i18n.locale(), …)` for "WEDNESDAY, OCTOBER 21" / "MIÉRCOLES, 21 DE OCTUBRE" and the "20 TUE" / "20 MAR" stamps.
- The choice is read from local storage on start, so the right language shows before login finishes, and saved to `profiles.language` through the profile sync in step 10.
- Your own entries are never translated, as the Settings note says.

Check: flip the toggle on Home and every label changes, with no missing-key gaps (the `Copy` type catches those at build time).

### Step 9. The local database

The local table mirrors `entries` column for column (in camelCase), plus one sync flag. Every screen reads from here.

```ts
// core/local-db.ts
export interface LocalEntry extends Entry {
  dirty: 0 | 1;   // 1 = changed here, not yet pushed (IndexedDB can't index booleans)
}

class HavenDb extends Dexie {
  entries!: Table<LocalEntry, string>;
  meta!: Table<{ key: string; value: string }, string>;
  constructor() {
    super('haven');
    this.version(1).stores({
      entries: 'id, kind, status, writtenAt, dirty',
      meta: 'key',          // lastPulledAt, profile cache, profileDirty
    });
  }
}
export const db = new HavenDb();
```

In `entries-repo.ts`:

- `save(entry)` sets `clientUpdatedAt = now`, `dirty = 1`, writes to Dexie, then tells the sync service there's work.
- `remove(id)` writes a **tombstone**: sets `deletedAt`, clears `title`, `body`, every reflection field and `feelingsNote`, empties `feelings` and `patterns`, sets `dirty = 1`. The deletion syncs and the words don't stay on the server.
- Lists use Dexie's `liveQuery`, wrapped as an Angular signal (`toSignal(from(liveQuery(…)), { initialValue: [] })`), filtering out rows with `deletedAt`. Saving anywhere updates Home and Journal instantly.
- **Search** (Journal) filters the local rows by title and all text fields, case- and accent-insensitive, so "Abuela" matches "abuela" and "reflexion" matches "reflexión":
  ```ts
  const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  ```
- **Export journal** runs a sync first (so a device that hasn't caught up doesn't export a partial journal), then reads all non-deleted local rows and downloads one JSON file, plus a readable Markdown file if you want it. If the sync fails, export anyway and say "Exported what's on this device."

Check: with the network turned off in DevTools, you can write, edit, search and delete entries.

### Step 10. Sync and the save-status line

Each sync run is **push, then pull**:

1. **Push entries:** read all rows with `dirty = 1`, convert to snake\_case, `upsert` them into `entries`. On success, set `dirty = 0` only if the row's `clientUpdatedAt` hasn't changed since you read it. If the server already holds a newer edit, the step 3 trigger skips your row; the pull below brings the newer version down.
2. **Push profile:** if `meta.profileDirty` is set, update your `profiles` row and clear the flag.
3. **Pull entries:** select rows where `updated_at > lastPulledAt − 1 minute`, ordered by `updated_at, id`, **in pages of 1,000** with `.range(from, from + 999)` until a page comes back short. Supabase returns at most 1,000 rows per request, so without paging a new device silently misses entries. For each row: if the local copy is dirty and its `clientUpdatedAt` is newer, keep local; otherwise overwrite local. Only after the last page, save the largest `updated_at` seen as the new `lastPulledAt`. The one-minute overlap is harmless (writes are idempotent) and covers slow transactions.
4. **Pull profile:** select your `profiles` row into the `meta` cache unless `profileDirty` is set.

```ts
// core/sync.ts (outline)
export type SaveState = 'saving' | 'saved' | 'offline' | 'error';

@Injectable({ providedIn: 'root' })
export class Sync {
  readonly state = signal<SaveState>('saved');
  private running = false;

  async run() {
    if (this.running) return;
    if (!navigator.onLine) { this.state.set('offline'); return; }
    this.running = true; this.state.set('saving');
    try { await this.push(); await this.pull(); this.state.set('saved'); }
    catch (e) { this.state.set(isNetworkError(e) ? 'offline' : 'error'); }
    finally { this.running = false; }
  }
}
```

`navigator.onLine` says true on Wi-Fi with no internet, so a failed `fetch` (a `TypeError`, or Supabase's `FetchError`) also counts as `offline`. Only a real server refusal shows `error`.

When to run it: on app start and login; on the browser's `online` event; when the tab becomes visible again; and about 2 seconds after the last keystroke (debounced). Local saves happen on every keystroke pause (about 500 ms), so nothing is lost if the tab closes.

The four states map straight to the Progress & feedback sheet:

| State | Shown as |
| --- | --- |
| `saving` | dot + "Saving…" |
| `saved` | check + "Saved" / "Saved as you write" |
| `offline` | cloud-off + "Offline — saved on this device" |
| `error` | error icon + "Couldn't save. Try again" (button calls `run()`) |

Note: if the Supabase project has paused, requests fail and the line shows the error state; your entries are still safe locally. Unpause from the dashboard and tap Try again.

Check: write on your phone with Wi-Fi off, turn it back on, then open the laptop: the entry appears within a few seconds of focusing the tab. Then edit the same entry on both devices while the phone is offline, edit the laptop *last*, reconnect the phone: the laptop's version wins on both.

### Step 11. Sign-in and the route guard

- **Login screen:** your mockups don't have one yet. Keep it to the Haven doorway mark, email, password and one olive Continue button, with the error input state for wrong details. No sign-up link, since signups are off.
- `auth.ts` exposes `session` as a signal fed by `supabase.auth.onAuthStateChange`, plus a `ready` signal that turns true on the first `INITIAL_SESSION` event. The Supabase client stores the session in local storage and refreshes it, so you stay signed in, even offline.
- A functional `CanActivateFn` guard waits for `ready`, then sends you to `/login` when there's no session. Never call `getUser()` in the guard: it always goes to the network. If a stored session exists, let the app open and sync later.
- **On sign-out**, run a sync first. If any rows are still `dirty = 1` afterwards (offline, or the sync failed), show a confirm sheet: "Some entries haven't synced yet and will be lost on this device." Only then clear the local database (`await db.delete(); await db.open();`) and the cached profile, so entries don't stay on a shared device.
- **Change password** in Settings calls `supabase.auth.updateUser({ password })`. It needs a connection; show the offline state otherwise.
- **Delete account** can wait. For a single user it's simpler to export and delete the project yourself; if you want it in-app later, it needs a small server function because the public key can't delete users.

Check: open the installed app with the network off, more than an hour after your last sign-in (so the access token has expired); it opens straight to Home.

### Step 12. Build the screens in this order

Each screen builds on the one before. With step 11's sign-in in place, you can use the app for real from screen 2 onward.

1. **App shell.** Bottom tab bar (Home · Journal · Settings) on mobile; left sidebar with the Haven lockup on desktop, switched with one breakpoint (`md:`). The tab bar pads itself with `env(safe-area-inset-bottom)` so it clears the iPhone home indicator in the installed app. Sidebar footer: "Your entries are private to your account."
2. **Write freely.** Title (optional) + writing area in `font-reflect text-writing`, date and time stamp, save-status line at the top, feeling chips at the bottom with Edit feelings. Done marks it `complete` and returns Home.
3. **Journal list.** Search box, All / Free writing / Reflections tabs, entries grouped by month ("OCTOBER 2026"), the date stamp column, a REFLECTION tag with the dot motif, and a clay "DRAFT · 3 OF 6" tag on unfinished reflections. Untitled entries show their opening line in italics.
4. **Entry detail + delete sheet.** Reflection detail shows all six numbered parts; Edit reopens the flow. Delete this entry opens the bottom sheet with Keep entry / Delete and the Export link.
5. **Reflection flow.** One route per part (`/reflect/:id/:part`). Stage bar, Save & exit, Back / Skip for now / Continue, the collapsible "Need a nudge?" prompts, the six pattern checkboxes on part 4. Every change saves locally; `current_step` follows you. Desktop adds the left list of parts that can be opened in any order.
6. **Review.** Name field, six summary rows with Edit or Write (for skipped parts), Keep as draft / Save reflection.
7. **Home.** Time-based greeting with your name, the two start cards, Pick up where you left off (newest draft reflection with its six dots), Recently (latest three, previews hidden when the setting is on), and the empty state with the sprout for a fresh journal.
8. **Settings.** Language toggle, name, email, change password, Hide previews on Home, How your data is handled, Export journal, the professional-care note and Finding support link. Name, language and Hide previews save to the local profile cache and set `profileDirty`.

For reference: Home's greeting uses the device's local hour: morning 5–11, afternoon 12–17, evening 18–4 (so a 2 a.m. "couldn't sleep" entry doesn't open with "Good morning").

### Step 13. PWA polish and deploy

**Manifest** (`public/manifest.webmanifest`, created in step 6):

- `name`: "Haven. The Journal.", `short_name`: "Haven"
- `theme_color`: `#59664F` (olive), `background_color`: `#F7F4ED` (ivory), `display`: `standalone`
- keep `start_url` and `scope` as `"./"` so they follow the base href on GitHub Pages
- Icons: replace the placeholders in `public/icons/` with the chosen Doorway mark on the olive tile, exported at 192 and 512, plus a 512 with `"purpose": "maskable"` and extra padding.

**`src/index.html` for iPhone:** set `<title>Haven</title>`, add `viewport-fit=cover` to the viewport meta (needed for the safe-area padding in step 12), and add:

```html
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">  <!-- 180×180, no transparency -->
<meta name="apple-mobile-web-app-title" content="Haven">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

**Service worker** (`ngsw-config.json`): keep the app shell prefetched, add `/fonts/*.woff2` to the `app` prefetch group (not the lazy `assets` group) so fonts are there on first offline open, and leave Supabase requests out of `dataGroups`. Dexie is already your offline data, so the service worker shouldn't cache API responses.

**Updates and storage** (`core/pwa.ts`, started from the app shell):

- Inject `SwUpdate`. When `versionUpdates` emits `VERSION_READY`, show a quiet line ("A new version of Haven is ready · Reload") that calls `document.location.reload()`. Call `checkForUpdate()` when the tab becomes visible. On `unrecoverable`, reload.
- After login, call `navigator.storage.persist()`. It asks the browser not to evict IndexedDB under storage pressure. On iPhone, an app added to the Home Screen is also exempt from Safari's 7-day storage cleanup, and keeps storage separate from Safari: you'll sign in once inside the installed app.

**Deploy to GitHub Pages:** automatic. Work happens on `development`; a PR into `main` runs `.github/workflows/deploy.yml`, which tests and builds (the PR check). Merging the PR pushes to `main`, and the same workflow tests, builds with `--base-href /haven-the-journal/`, copies `index.html` to `404.html` and deploys to `https://keimdja.github.io/haven-the-journal/`. The `404.html` copy makes deep links work on the very first visit; after that the service worker serves the app for every route.

One-time repo settings: **Settings → Pages → Source: GitHub Actions**, and a branch rule on `main` that requires a pull request and the "Build and test" check.

Then install it: on iPhone, Safari → Share → Add to Home Screen; on desktop Chrome, the install icon in the address bar.

Check: Chrome DevTools → Application → Manifest shows no errors or installability warnings; after a second deploy, the open app shows the "new version" line.

## Done checklist

- [ ] Supabase signups off; one user; both tables with row-level security on; Advisors clean
- [ ] Anonymous request to `entries` returns `[]`
- [ ] An older edit can't overwrite a newer one (stale-write trigger)
- [ ] Styleguide route matches the Design Foundations sheet
- [ ] Language toggle switches every label, dates included
- [ ] Write, edit, search and delete work with the network off
- [ ] Entry written offline on the phone appears on the laptop after reconnecting
- [ ] Deleted entries leave no text on the server
- [ ] Save-status line shows all four states (Saving, Saved, Offline, Couldn't save)
- [ ] Signing out with unsynced entries warns before clearing
- [ ] A half-finished reflection shows "Draft · 3 of 6" and resumes on the right part
- [ ] Export downloads every entry
- [ ] Installed on phone and desktop from GitHub Pages; opens offline, fonts included; tab bar clears the home indicator
- [ ] A new deploy shows the "new version" line in the open app
- [ ] Sidebar copy reads "Your entries are private to your account."

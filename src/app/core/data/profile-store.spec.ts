import { TestBed } from '@angular/core/testing';

import { I18n } from '../i18n/i18n';
import { LocalDb } from './local-db';
import type { Profile } from './models';
import { ProfileStore } from './profile-store';
import { Sync } from './sync';

describe('ProfileStore', () => {
  let db: LocalDb;
  let sync: { requestSoon: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    sync = { requestSoon: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: Sync, useValue: sync }] });
    db = TestBed.inject(LocalDb);
  });
  afterEach(async () => {
    localStorage.clear();
    await db.delete();
  });

  it('saves a change here, marks it for upload, and asks sync to push', async () => {
    const store = TestBed.inject(ProfileStore);
    await store.update({ displayName: 'K' });

    expect((await db.meta.get('profile'))?.value).toEqual({
      displayName: 'K',
      language: 'en',
      hidePreviews: false,
    });
    expect((await db.meta.get('profileDirty'))?.value).toBe(true);
    expect(sync.requestSoon).toHaveBeenCalled();
  });

  it('keeps the other settings when changing one', async () => {
    const store = TestBed.inject(ProfileStore);
    await store.update({ displayName: 'K', hidePreviews: true });
    await store.update({ language: 'es' });

    expect((await db.meta.get('profile'))?.value).toEqual({
      displayName: 'K',
      language: 'es',
      hidePreviews: true,
    });
  });

  it('switches the app to the profile’s language when it arrives', async () => {
    const pulled: Profile = { displayName: 'K', language: 'es', hidePreviews: false };
    await db.meta.put({ key: 'profile', value: pulled });

    const store = TestBed.inject(ProfileStore);
    await vi.waitFor(() => expect(store.profile()).toEqual(pulled));
    TestBed.tick();
    expect(TestBed.inject(I18n).lang()).toBe('es');
  });

  it('keeps a language just chosen here, and saves it for other devices', async () => {
    await db.meta.put({
      key: 'profile',
      value: { displayName: 'K', language: 'en', hidePreviews: false },
    });
    const store = TestBed.inject(ProfileStore);
    const i18n = TestBed.inject(I18n);
    await vi.waitFor(() => expect(store.profile()?.language).toBe('en'));
    TestBed.tick();

    await store.setLanguage('es');
    TestBed.tick();

    expect(i18n.lang()).toBe('es');
    expect((await db.meta.get('profile'))?.value).toMatchObject({ language: 'es' });
    expect((await db.meta.get('profileDirty'))?.value).toBe(true);
  });
});

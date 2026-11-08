import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Auth } from '../../core/auth/auth';
import { SignOutFlow } from '../../core/auth/sign-out';
import type { Profile } from '../../core/data/models';
import { ProfileStore } from '../../core/data/profile-store';
import { I18n } from '../../core/i18n/i18n';
import { NAME_SAVE_MS, Settings } from './settings';

describe('Settings', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function setup(profile: Profile | null = null) {
    const store = {
      profile: signal(profile),
      update: vi.fn().mockResolvedValue(undefined),
      setLanguage: vi.fn(async (lang: 'en' | 'es') => TestBed.inject(I18n).setLang(lang)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ProfileStore, useValue: store },
        { provide: Auth, useValue: { user: signal({ email: 'k@example.com' }) } },
        { provide: SignOutFlow, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return {
      store,
      fixture,
      host,
      nameInput: host.querySelector<HTMLInputElement>('input[type="text"]')!,
    };
  }

  it('shows the language choice with the current one selected', () => {
    const { host } = setup();
    const radios = host.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].checked).toBe(true);
    expect(host.textContent).toContain('Español');
  });

  it('changes the language', async () => {
    const { store, fixture, host } = setup();
    host.querySelectorAll('label')[1].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(store.setLanguage).toHaveBeenCalledWith('es');
    expect(host.querySelector('h1')!.textContent).toContain('Ajustes');
  });

  it('shows your email, read-only', () => {
    const { host } = setup();
    expect(host.textContent).toContain('k@example.com');
    expect(host.querySelectorAll('input[type="email"]')).toHaveLength(0);
  });

  it('shows your name and saves changes once typing pauses', () => {
    const { store, nameInput } = setup({ displayName: 'K', language: 'en', hidePreviews: false });
    expect(nameInput.value).toBe('K');

    vi.useFakeTimers();
    nameInput.value = '  Keirelys ';
    nameInput.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(NAME_SAVE_MS - 1);
    expect(store.update).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(store.update).toHaveBeenCalledWith({ displayName: 'Keirelys' });
  });

  it('saves a half-typed name on the way out', () => {
    const { store, fixture, nameInput } = setup();
    nameInput.value = 'K';
    nameInput.dispatchEvent(new Event('input'));
    fixture.destroy();
    expect(store.update).toHaveBeenCalledWith({ displayName: 'K' });
  });

  it('names the field by its row', () => {
    const { host, nameInput } = setup();
    const label = host.querySelector(`#${nameInput.getAttribute('aria-labelledby')}`);
    expect(label?.textContent).toContain('Name');
  });
});

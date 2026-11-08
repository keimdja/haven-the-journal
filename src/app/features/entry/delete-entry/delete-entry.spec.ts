import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../../core/data/entries-repo';
import type { Entry } from '../../../core/data/models';
import { DeleteEntry } from './delete-entry';

const titled: Entry = { ...blankEntry('free'), id: 'a', title: 'The meeting with Ana' };

describe('DeleteEntry', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  function setup(entry: Entry = titled) {
    const repo = { remove: vi.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: EntriesRepo, useValue: repo }],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(DeleteEntry);
    fixture.componentRef.setInput('entry', entry);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const dialog = host.querySelector('dialog')!;
    const openSheet = () => {
      host.querySelector<HTMLButtonElement>('footer button')!.click();
      fixture.detectChanges();
    };
    const [keep, confirm] = Array.from(dialog.querySelectorAll('.grid button')) as HTMLElement[];
    return { repo, router, fixture, dialog, openSheet, keep, confirm };
  }

  it('asks first, naming the entry', () => {
    const { repo, dialog, openSheet } = setup();
    expect(dialog.open).toBe(false);

    openSheet();

    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('“The meeting with Ana” will be removed');
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('words it differently for an untitled entry', () => {
    const { dialog, openSheet } = setup({ ...titled, title: null });
    openSheet();
    expect(dialog.textContent).toContain('This entry will be removed');
  });

  it('offers an export first', () => {
    const { dialog } = setup();
    expect(dialog.querySelector('a')!.getAttribute('href')).toBe('/settings');
  });

  it('keeps the entry if you change your mind', () => {
    const { repo, fixture, dialog, openSheet, keep } = setup();
    openSheet();
    keep.click();
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('deletes and returns to the Journal once confirmed', async () => {
    const { repo, router, fixture, openSheet, confirm } = setup();
    openSheet();
    confirm.click();
    await fixture.whenStable();

    expect(repo.remove).toHaveBeenCalledWith('a');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/journal', { replaceUrl: true });
  });
});

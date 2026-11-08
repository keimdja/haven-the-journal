import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../core/data/entries-repo';
import type { Entry } from '../../core/data/models';
import { Sync } from '../../core/data/sync';
import { Editor } from './editor';

const saved: Entry = {
  ...blankEntry('free', new Date(2026, 9, 21, 21, 12)),
  id: 'entry-1',
  title: 'A quiet Wednesday',
  body: 'The first morning this month.',
};

describe('Editor', () => {
  async function open(id: string, found: Entry | null = saved) {
    const repo = {
      byId: vi.fn().mockResolvedValue(found ?? undefined),
      create: vi.fn().mockResolvedValue({ ...saved, id: 'created' }),
    };
    const sync = { state: signal('saved'), run: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: EntriesRepo, useValue: repo },
        { provide: Sync, useValue: sync },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(Editor);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { repo, router, host: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => vi.restoreAllMocks());

  it('shows the entry’s date, title and words', async () => {
    const { host } = await open('entry-1');
    expect(host.querySelector('main p')!.textContent?.replace(/\s/g, ' ')).toContain(
      'Wednesday, October 21 · 9:12 pm',
    );
    expect(host.querySelector<HTMLInputElement>('#entry-title')!.value).toBe('A quiet Wednesday');
    expect(host.querySelector('textarea')!.value).toBe('The first morning this month.');
  });

  it('has labelled fields, the save status and a way out', async () => {
    const { host } = await open('entry-1');
    expect(host.querySelector('label[for="entry-title"]')).not.toBeNull();
    expect(host.querySelector('label[for="entry-body"]')).not.toBeNull();
    expect(host.querySelector('app-save-status')!.textContent).toContain('Saved');
    expect(Array.from(host.querySelectorAll('header a')).map((a) => a.textContent?.trim())).toEqual(
      ['Home', 'Done'],
    );
  });

  it('starts a new entry and moves to its address', async () => {
    const { repo, router } = await open('new');
    expect(repo.create).toHaveBeenCalledWith('free');
    expect(router.navigate).toHaveBeenCalledWith(['/write', 'created'], { replaceUrl: true });
  });

  it('goes Home if the entry doesn’t exist', async () => {
    const { router } = await open('missing', null);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });
});

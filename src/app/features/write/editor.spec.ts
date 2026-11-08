import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../core/data/entries-repo';
import type { Entry } from '../../core/data/models';
import { Sync } from '../../core/data/sync';
import { AUTOSAVE_MS, Editor } from './editor';

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
      save: vi.fn(async (entry: Entry) => entry),
      remove: vi.fn().mockResolvedValue(undefined),
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
    return { repo, router, fixture, host: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function type(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }
  const body = (host: HTMLElement) => host.querySelector('textarea')!;
  const title = (host: HTMLElement) => host.querySelector<HTMLInputElement>('#entry-title')!;

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

  it('saves once typing pauses, with everything typed so far', async () => {
    const { repo, host } = await open('entry-1');
    vi.useFakeTimers();

    type(body(host), 'One');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_MS - 1);
    type(body(host), 'One two');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_MS - 1);
    expect(repo.save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save.mock.calls[0][0]).toMatchObject({ body: 'One two' });
  });

  it('doesn’t save when nothing actually changed', async () => {
    const { repo, host } = await open('entry-1');
    vi.useFakeTimers();

    type(title(host), 'A quiet Wednesday  ');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_MS);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('saves what’s pending when you leave, without waiting', async () => {
    const { repo, fixture, host } = await open('entry-1');
    type(body(host), 'Last words');

    fixture.destroy();

    await vi.waitFor(() => expect(repo.save).toHaveBeenCalledTimes(1));
    expect(repo.save.mock.calls[0][0]).toMatchObject({ body: 'Last words' });
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('saves when the app goes to the background', async () => {
    const { repo, host } = await open('entry-1');
    type(body(host), 'Before the phone locks');
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');

    document.dispatchEvent(new Event('visibilitychange'));

    await vi.waitFor(() => expect(repo.save).toHaveBeenCalledTimes(1));
  });

  it('removes an entry left completely blank', async () => {
    const blank = { ...blankEntry('free'), id: 'blank' };
    const { repo, fixture } = await open('blank', blank);

    fixture.destroy();

    await vi.waitFor(() => expect(repo.remove).toHaveBeenCalledWith('blank'));
  });

  it('keeps a blank-looking entry that has feelings', async () => {
    const felt: Entry = { ...blankEntry('free'), id: 'felt', feelings: ['calm'] };
    const { repo, fixture } = await open('felt', felt);

    fixture.destroy();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(repo.remove).not.toHaveBeenCalled();
  });
});

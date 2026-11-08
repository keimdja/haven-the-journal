import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../../core/data/entries-repo';
import type { Entry } from '../../../core/data/models';
import { AUTOSAVE_MS, Review } from './review';

const draft: Entry = {
  ...blankEntry('reflection', new Date(2026, 9, 21, 21, 0)),
  id: 'r1',
  currentStep: 6,
  title: 'The meeting',
  whatHappened: 'She pushed back.',
  feelings: ['anxious'],
  customFeelings: ['Small'],
  patterns: ['reading_minds'],
};

async function settle(fixture: ComponentFixture<Review>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('Review', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function open(found: Entry | null = draft) {
    const repo = {
      byId: vi.fn().mockResolvedValue(found ?? undefined),
      save: vi.fn(async (entry: Entry) => entry),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: EntriesRepo, useValue: repo }],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(Review);
    fixture.componentRef.setInput('id', found?.id ?? 'missing');
    fixture.detectChanges();
    await settle(fixture);

    const host = fixture.nativeElement as HTMLElement;
    const press = async (label: string) => {
      Array.from(host.querySelectorAll<HTMLButtonElement>('footer button'))
        .find((button) => button.textContent?.trim() === label)!
        .click();
      await settle(fixture);
    };
    return { repo, router, fixture, host, press };
  }

  it('shows the date, the name field and all six parts', async () => {
    const { host } = await open();
    expect(host.querySelector('header p')!.textContent).toContain('Wednesday, October 21');
    expect(host.querySelector<HTMLInputElement>('input')!.value).toBe('The meeting');
    expect(host.querySelectorAll('ol li')).toHaveLength(6);
  });

  it('summarizes answers and offers Edit, or Write for skipped parts', async () => {
    const { host } = await open();
    const rows = Array.from(host.querySelectorAll('ol li'));
    expect(rows[0].textContent).toContain('She pushed back.');
    expect(rows[0].querySelector('a')!.textContent?.trim()).toBe('Edit');
    expect(rows[0].querySelector('a')!.getAttribute('aria-label')).toBe('Edit part 1');
    expect(rows[0].querySelector('a')!.getAttribute('href')).toBe('/reflect/r1/1');

    expect(rows[1].querySelector('a')!.textContent?.trim()).toBe('Write');
    expect(rows[2].textContent).toContain('Anxious · Small');
    expect(rows[3].textContent).toContain('Reading minds');
  });

  it('saves the name once typing pauses', async () => {
    const { repo, host } = await open();
    vi.useFakeTimers();
    const name = host.querySelector('input')!;
    name.value = 'A new name';
    name.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(AUTOSAVE_MS);

    expect(repo.save.mock.calls[0][0]).toMatchObject({ title: 'A new name' });
  });

  it('keeps it as a draft and returns to the Journal', async () => {
    const { repo, router, press } = await open();
    await press('Keep as draft');

    expect(repo.save.mock.calls.at(-1)![0]).toMatchObject({ status: 'draft', currentStep: 6 });
    expect(router.navigate).toHaveBeenCalledWith(['/journal'], { replaceUrl: true });
  });

  it('saves it as finished and shows it', async () => {
    const { repo, router, press } = await open();
    await press('Save reflection');

    expect(repo.save.mock.calls.at(-1)![0]).toMatchObject({
      status: 'complete',
      currentStep: null,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/entry', 'r1'], { replaceUrl: true });
  });

  it('has no Keep as draft for a finished reflection', async () => {
    const { host } = await open({ ...draft, status: 'complete', currentStep: null });
    const labels = Array.from(host.querySelectorAll('footer button')).map((b) =>
      b.textContent?.trim(),
    );
    expect(labels).toEqual(['Save reflection']);
  });

  it('doesn’t keep a completely blank reflection', async () => {
    const blank: Entry = { ...blankEntry('reflection'), id: 'b1' };
    const { repo, router, press } = await open(blank);
    await press('Save reflection');

    expect(repo.remove).toHaveBeenCalledWith('b1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('goes Home if the reflection doesn’t exist', async () => {
    const { router } = await open(null);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });
});

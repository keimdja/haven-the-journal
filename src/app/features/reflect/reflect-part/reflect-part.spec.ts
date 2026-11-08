import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../../core/data/entries-repo';
import type { Entry } from '../../../core/data/models';
import { AUTOSAVE_MS, ReflectPart } from './reflect-part';

const draft: Entry = { ...blankEntry('reflection'), id: 'r1' };

/** Lets the screen finish loading: a waiting save, then the entry from the repository. */
async function settle(fixture: ComponentFixture<ReflectPart>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('ReflectPart', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function open(id: string, part: string, found: Entry | null = draft) {
    const repo = {
      byId: vi.fn().mockResolvedValue(found ?? undefined),
      create: vi.fn().mockResolvedValue({ ...draft, id: 'created' }),
      save: vi.fn(async (entry: Entry) => entry),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: EntriesRepo, useValue: repo }],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ReflectPart);
    fixture.componentRef.setInput('id', id);
    fixture.componentRef.setInput('part', part);
    fixture.detectChanges();
    await settle(fixture);

    const host = fixture.nativeElement as HTMLElement;
    const links = () =>
      Array.from(host.querySelectorAll('footer a')).map((a) => [
        a.textContent?.trim(),
        a.getAttribute('href'),
      ]);
    return { repo, router, fixture, host, links };
  }

  it('shows the frame around a part', async () => {
    const { host } = await open('r1', '2');
    expect(host.querySelector('h1')!.textContent).toContain('What went through my mind?');
    expect(host.querySelector('header p')!.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Part 2 of 6',
    );
    expect(host.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('2');
    expect(host.querySelector('header a')!.getAttribute('href')).toBe('/');
  });

  it('moves back and forward through the parts', async () => {
    const { links } = await open('r1', '2');
    expect(links()).toEqual([
      ['Back', '/reflect/r1/1'],
      ['Skip for now', '/reflect/r1/3'],
      ['Continue', '/reflect/r1/3'],
    ]);
  });

  it('has no Back on part 1', async () => {
    const { links } = await open('r1', '1');
    expect(links().map(([label]) => label)).toEqual(['Skip for now', 'Continue']);
  });

  it('goes on to the review after part 6', async () => {
    const { links } = await open('r1', '6');
    expect(links().at(-1)).toEqual(['Continue', '/reflect/r1/review']);
  });

  it('starts a new reflection and moves to its address', async () => {
    const { repo, router } = await open('new', '1');
    expect(repo.create).toHaveBeenCalledWith('reflection');
    expect(router.navigate).toHaveBeenCalledWith(['/reflect', 'created', '1'], {
      replaceUrl: true,
    });
  });

  it('goes to part 1 for a part that doesn’t exist', async () => {
    const { router } = await open('r1', '9');
    expect(router.navigate).toHaveBeenCalledWith(['/reflect', 'r1', '1'], { replaceUrl: true });
  });

  it('goes Home if the reflection doesn’t exist, or is free writing', async () => {
    const missing = await open('nope', '1', null);
    expect(missing.router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });

    TestBed.resetTestingModule();
    const free = await open('f1', '1', { ...blankEntry('free'), id: 'f1' });
    expect(free.router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  describe('text parts', () => {
    function type(host: HTMLElement, value: string) {
      const page = host.querySelector('textarea')!;
      page.value = value;
      page.dispatchEvent(new Event('input'));
    }

    it('shows the question, helper and saved note', async () => {
      const { host } = await open('r1', '1');
      expect(host.querySelector('h1')!.textContent).toContain('What happened?');
      expect(host.textContent).toContain('Just what happened, not what it meant.');
      expect(host.textContent).toContain('Saved as you write');
    });

    it('shows what was already written', async () => {
      const { host } = await open('r1', '2', { ...draft, thoughts: 'Earlier words' });
      expect(host.querySelector('textarea')!.value).toBe('Earlier words');
    });

    it('saves the answer to its own field once typing pauses', async () => {
      const { repo, host } = await open('r1', '5');
      vi.useFakeTimers();

      type(host, 'Another way');
      await vi.advanceTimersByTimeAsync(AUTOSAVE_MS - 1);
      expect(repo.save).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);

      expect(repo.save.mock.calls[0][0]).toMatchObject({ reframe: 'Another way' });
    });

    it('stores a blank answer as nothing', async () => {
      const { repo, host } = await open('r1', '1', { ...draft, whatHappened: 'Words' });
      vi.useFakeTimers();

      type(host, '   ');
      await vi.advanceTimersByTimeAsync(AUTOSAVE_MS);

      expect(repo.save.mock.calls[0][0]).toMatchObject({ whatHappened: null });
    });

    it('saves straight away when moving to another part, keeping the answer', async () => {
      const { repo, fixture, host } = await open('r1', '1');
      type(host, 'Moved on quickly');
      fixture.detectChanges(); // as after a real keystroke

      fixture.componentRef.setInput('part', '2');
      fixture.detectChanges();
      await settle(fixture);

      expect(repo.save.mock.calls[0][0]).toMatchObject({ whatHappened: 'Moved on quickly' });
      expect(host.querySelector('h1')!.textContent).toContain('What went through my mind?');
      expect(host.querySelector('textarea')!.value).toBe('');
    });

    it('saves on the way out', async () => {
      const { repo, fixture, host } = await open('r1', '1');
      type(host, 'Last words');
      fixture.destroy();
      await vi.waitFor(() => expect(repo.save).toHaveBeenCalledTimes(1));
    });

    it('opens nudges and adds one as a new line', async () => {
      const { fixture, host } = await open('r1', '1', { ...draft, whatHappened: 'Started' });
      host.querySelector<HTMLButtonElement>('app-nudges button')!.click();
      fixture.detectChanges();

      const prompts = host.querySelectorAll<HTMLButtonElement>('app-nudges li button');
      expect(prompts).toHaveLength(3);
      prompts[1].click();
      fixture.detectChanges();

      expect(host.querySelector('textarea')!.value).toBe(
        'Started\n\nWhat happened right before?\n',
      );
    });

    it('shows part 6’s single line as a hint, not a button', async () => {
      const { host } = await open('r1', '6');
      expect(host.querySelector('app-nudges button')).toBeNull();
      expect(host.querySelector('app-nudges')!.textContent).toContain('It can be small.');
    });
  });

  describe('feelings part', () => {
    it('shows the question and the picker already open, without a second heading', async () => {
      const { host } = await open('r1', '3');
      expect(host.querySelector('h1')!.textContent).toContain('What did I feel?');
      expect(host.querySelectorAll('button[aria-pressed]')).toHaveLength(14);
      expect(host.textContent).not.toContain('How does this feel?');
    });

    it('marks the feelings already chosen, and shows the note', async () => {
      const { host } = await open('r1', '3', {
        ...draft,
        feelings: ['sad'],
        customFeelings: ['Small'],
        feelingsNote: 'A knot in my stomach.',
      });
      const pressed = host.querySelector('button[aria-pressed="true"]')!;
      expect(pressed.textContent).toContain('Sad');
      expect(host.textContent).toContain('Small');
      expect(host.querySelector('textarea')!.value).toBe('A knot in my stomach.');
    });

    it('saves chosen feelings and the note', async () => {
      const { repo, fixture, host } = await open('r1', '3');
      vi.useFakeTimers();

      const calm = Array.from(host.querySelectorAll<HTMLButtonElement>('button[aria-pressed]'))[0];
      calm.click();
      fixture.detectChanges();
      const note = host.querySelector('textarea')!;
      note.value = 'Better by evening.';
      note.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(AUTOSAVE_MS);

      expect(repo.save.mock.calls[0][0]).toMatchObject({
        feelings: ['calm'],
        feelingsNote: 'Better by evening.',
      });
    });
  });

  describe('patterns part', () => {
    it('lists all eleven patterns with their examples, in a named group', async () => {
      const { host } = await open('r1', '4');
      expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(11);
      expect(host.textContent).toContain('Reading minds');
      expect(host.textContent).toContain('“They must think I’m…”');
      expect(host.textContent).toContain('None of these fit?');

      const group = host.querySelector('[role="group"]')!;
      const heading = host.querySelector(`#${group.getAttribute('aria-labelledby')}`);
      expect(heading?.textContent).toContain('What thinking patterns do I recognize?');
    });

    it('ticks the patterns already chosen', async () => {
      const { host } = await open('r1', '4', { ...draft, patterns: ['reading_minds'] });
      const boxes = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
      expect(boxes.filter((box) => box.checked)).toHaveLength(1);
      expect(boxes[2].checked).toBe(true);
    });

    it('saves ticked patterns in the list’s order', async () => {
      const { repo, fixture, host } = await open('r1', '4');
      vi.useFakeTimers();

      const boxes = host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
      boxes[5].click();
      fixture.detectChanges();
      boxes[0].click();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(AUTOSAVE_MS);

      expect(repo.save.mock.calls[0][0]).toMatchObject({
        patterns: ['minimize_magnify', 'jumping_to_conclusions'],
      });
    });
  });

  describe('progress', () => {
    const written: Entry = { ...draft, whatHappened: 'Words' };

    it('remembers the part you’re on in a draft', async () => {
      const { repo } = await open('r1', '3', written);
      await vi.waitFor(() =>
        expect(repo.save.mock.calls.at(-1)?.[0]).toMatchObject({ currentStep: 3 }),
      );
    });

    it('follows you back and forward', async () => {
      const { repo, fixture } = await open('r1', '3', { ...written, currentStep: 3 });
      expect(repo.save).not.toHaveBeenCalled();

      fixture.componentRef.setInput('part', '2');
      fixture.detectChanges();
      await settle(fixture);

      await vi.waitFor(() =>
        expect(repo.save.mock.calls.at(-1)?.[0]).toMatchObject({ currentStep: 2 }),
      );
    });

    it('leaves a finished reflection’s progress alone', async () => {
      const { repo, fixture } = await open('r1', '3', { ...written, status: 'complete' });
      fixture.destroy();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('keeps a draft with something in it on Save & exit', async () => {
      const { repo, fixture } = await open('r1', '1', written);
      fixture.destroy();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('removes a draft left completely blank', async () => {
      const { repo, fixture } = await open('r1', '1');
      fixture.destroy();
      await vi.waitFor(() => expect(repo.remove).toHaveBeenCalledWith('r1'));
    });

    it('keeps a blank draft when going on to its review', async () => {
      const { repo, router, fixture } = await open('r1', '6', { ...draft, currentStep: 6 });
      vi.spyOn(router, 'currentNavigation').mockReturnValue({
        finalUrl: { toString: () => '/reflect/r1/review' },
      } as ReturnType<Router['currentNavigation']>);

      fixture.destroy();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});

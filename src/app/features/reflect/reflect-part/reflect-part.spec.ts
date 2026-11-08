import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { EntriesRepo, blankEntry } from '../../../core/data/entries-repo';
import type { Entry } from '../../../core/data/models';
import { ReflectPart } from './reflect-part';

const draft: Entry = { ...blankEntry('reflection'), id: 'r1' };

describe('ReflectPart', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  async function open(id: string, part: string, found: Entry | null = draft) {
    const repo = {
      byId: vi.fn().mockResolvedValue(found ?? undefined),
      create: vi.fn().mockResolvedValue({ ...draft, id: 'created' }),
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
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const links = () =>
      Array.from(host.querySelectorAll('footer a')).map((a) => [
        a.textContent?.trim(),
        a.getAttribute('href'),
      ]);
    return { repo, router, host, links };
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
});

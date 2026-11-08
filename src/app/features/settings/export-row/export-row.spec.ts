import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EntriesRepo, blankEntry } from '../../../core/data/entries-repo';
import { FileDownload } from '../../../core/data/file-download';
import type { SaveState } from '../../../shared/ui/save-status/save-status';
import { Sync } from '../../../core/data/sync';
import { ExportRow } from './export-row';

describe('ExportRow', () => {
  beforeEach(() => localStorage.clear());

  async function setup(state: SaveState = 'saved') {
    const order: string[] = [];
    const entries = [{ ...blankEntry('free'), id: 'a', title: 'Sunday', body: 'Words' }];
    const sync = {
      run: vi.fn(async () => void order.push('sync')),
      state: signal(state),
    };
    const repo = {
      allNow: vi.fn(async () => {
        order.push('read');
        return entries;
      }),
    };
    const files = { save: vi.fn(() => void order.push('download')) };
    TestBed.configureTestingModule({
      providers: [
        { provide: Sync, useValue: sync },
        { provide: EntriesRepo, useValue: repo },
        { provide: FileDownload, useValue: files },
      ],
    });
    const fixture = TestBed.createComponent(ExportRow);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('button[app-settings-row]')!.click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    return { order, files, fixture, host };
  }

  it('syncs, reads, then downloads the JSON', async () => {
    const { order, files, host } = await setup();
    expect(order).toEqual(['sync', 'read', 'download']);
    const [name, contents, type] = files.save.mock.calls[0] as unknown as [string, string, string];
    expect(name).toMatch(/^haven-journal-.*\.json$/);
    expect(JSON.parse(contents).entries[0].id).toBe('a');
    expect(type).toBe('application/json');
    expect(host.querySelector('[role="status"]')!.textContent).toContain('Exported.');
  });

  it('says so when it could only export this device', async () => {
    const { files, host } = await setup('offline');
    expect(files.save).toHaveBeenCalled();
    expect(host.querySelector('[role="status"]')!.textContent).toContain(
      'Exported what’s on this device.',
    );
  });

  it('offers a readable copy afterwards', async () => {
    const { files, fixture, host } = await setup();
    host.querySelector<HTMLButtonElement>('[role="status"] button')!.click();
    fixture.detectChanges();

    const [name, contents, type] = files.save.mock.calls[1] as unknown as [string, string, string];
    expect(name).toMatch(/\.md$/);
    expect(contents).toContain('## Sunday');
    expect(type).toBe('text/markdown');
  });
});

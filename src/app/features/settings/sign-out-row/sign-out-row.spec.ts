import { TestBed } from '@angular/core/testing';

import { SignOutFlow } from '../../../core/auth/sign-out';
import { SignOutRow } from './sign-out-row';

describe('SignOutRow', () => {
  async function setup(unsynced: boolean) {
    const flow = {
      hasUnsyncedChanges: vi.fn().mockResolvedValue(unsynced),
      finish: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({ providers: [{ provide: SignOutFlow, useValue: flow }] });
    const fixture = TestBed.createComponent(SignOutRow);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    host.querySelector<HTMLButtonElement>('button[app-settings-row]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    return { flow, fixture, host, dialog: host.querySelector('dialog')! };
  }

  it('signs out straight away when everything has synced', async () => {
    const { flow, dialog } = await setup(false);
    expect(flow.finish).toHaveBeenCalled();
    expect(dialog.open).toBe(false);
  });

  it('warns first when something couldn’t sync', async () => {
    const { flow, dialog } = await setup(true);
    expect(flow.finish).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('can’t be recovered');
  });

  it('stays signed in if you choose to', async () => {
    const { flow, fixture, dialog } = await setup(true);
    dialog.querySelectorAll('button')[0].click();
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
    expect(flow.finish).not.toHaveBeenCalled();
  });

  it('signs out anyway once you confirm', async () => {
    const { flow, fixture, dialog } = await setup(true);
    dialog.querySelectorAll('button')[1].click();
    await fixture.whenStable();

    expect(flow.finish).toHaveBeenCalled();
  });
});

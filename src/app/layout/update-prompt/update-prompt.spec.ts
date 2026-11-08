import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Pwa } from '../../core/pwa/pwa';
import { UpdatePrompt } from './update-prompt';

describe('UpdatePrompt', () => {
  beforeEach(() => localStorage.clear());

  function setup(ready: boolean) {
    const pwa = { updateReady: signal(ready), reload: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: Pwa, useValue: pwa }] });
    const fixture = TestBed.createComponent(UpdatePrompt);
    fixture.detectChanges();
    return { pwa, host: fixture.nativeElement as HTMLElement };
  }

  it('stays out of the way until there’s an update', () => {
    expect(setup(false).host.querySelector('[role="status"]')).toBeNull();
  });

  it('offers to reload', () => {
    const { pwa, host } = setup(true);
    expect(host.querySelector('[role="status"]')!.textContent).toContain(
      'A new version of Haven is ready',
    );
    host.querySelector('button')!.click();
    expect(pwa.reload).toHaveBeenCalled();
  });
});

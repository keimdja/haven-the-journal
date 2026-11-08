import { TestBed } from '@angular/core/testing';

import { SaveState, SaveStatus } from './save-status';

function render(state: SaveState) {
  const fixture = TestBed.createComponent(SaveStatus);
  fixture.componentRef.setInput('state', state);
  fixture.detectChanges();
  return { fixture, host: fixture.nativeElement as HTMLElement };
}

describe('SaveStatus', () => {
  it('is a polite status region', () => {
    const { host } = render('saving');
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
    expect(host.textContent).toContain('Saving…');
  });

  it('shows each state with its icon', () => {
    expect(render('saved').host.querySelector('app-icon')).not.toBeNull();
    expect(render('offline').host.textContent).toContain('saved on this device');
    expect(render('saving').host.querySelector('app-icon')).toBeNull();
  });

  it('offers Try again only when saving failed', () => {
    expect(render('saved').host.querySelector('button')).toBeNull();

    const { fixture, host } = render('error');
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));

    expect(host.className).toContain('text-error');
    host.querySelector('button')!.click();
    expect(retried).toBe(true);
  });
});

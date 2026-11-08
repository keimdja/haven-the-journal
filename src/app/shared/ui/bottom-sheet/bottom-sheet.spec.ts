import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BottomSheet } from './bottom-sheet';

@Component({
  imports: [BottomSheet],
  template: `
    <app-bottom-sheet heading="Delete this entry?" [alert]="true" [(open)]="open">
      <p>This can't be undone.</p>
      <button type="button" (click)="open.set(false)">Keep entry</button>
    </app-bottom-sheet>
  `,
})
class Host {
  readonly open = signal(false);
}

describe('BottomSheet', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    return { fixture, host: fixture.componentInstance, dialog };
  }

  it('is a labelled alert dialog, closed at first', () => {
    const { dialog } = setup();
    const heading = dialog.querySelector('h2')!;
    expect(dialog.open).toBe(false);
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading.textContent).toContain('Delete this entry?');
  });

  it('opens and closes with the bound value', () => {
    const { fixture, host, dialog } = setup();

    host.open.set(true);
    fixture.detectChanges();
    expect(dialog.open).toBe(true);

    dialog.querySelector('button')!.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
  });

  it('reports a close from the browser (Esc, backdrop) back to the binding', () => {
    const { fixture, host, dialog } = setup();
    host.open.set(true);
    fixture.detectChanges();

    dialog.close();
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });
});

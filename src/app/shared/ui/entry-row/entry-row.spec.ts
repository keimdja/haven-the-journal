import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EntryRow } from './entry-row';

@Component({
  imports: [EntryRow],
  template: `
    <a
      app-entry-row
      href="/entry/1"
      [date]="date"
      [title]="title()"
      [preview]="preview"
      kind="reflection"
      [showKind]="showKind()"
      [draftPart]="draftPart()"
      [hidePreview]="hidePreview()"
    ></a>
  `,
})
class Host {
  readonly date = new Date(2026, 9, 20, 20, 40);
  readonly preview = 'I kept replaying what I said.';
  readonly title = signal<string | null>('The meeting with Ana');
  readonly showKind = signal(false);
  readonly draftPart = signal<number | null>(null);
  readonly hidePreview = signal(false);
}

describe('EntryRow', () => {
  function setup(changes: (host: Host) => void = () => {}) {
    const fixture = TestBed.createComponent(Host);
    changes(fixture.componentInstance);
    fixture.detectChanges();
    const row = (fixture.nativeElement as HTMLElement).querySelector('a')!;
    const title = () => row.querySelector('.entry-title')!;
    return { row, title };
  }

  it('shows the date, the title and the preview', () => {
    const { row, title } = setup();
    expect(row.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-20');
    expect(title().textContent).toContain('The meeting with Ana');
    expect(row.textContent).toContain('I kept replaying');
    expect(row.querySelector('app-kind-tag')).toBeNull();
  });

  it('uses the opening words, in italic, when there is no title', () => {
    const { title } = setup((host) => host.title.set(null));
    expect(title().textContent).toContain('I kept replaying');
    expect(title().className).toContain('italic');
  });

  it('shows titles only when previews are hidden', () => {
    const { row } = setup((host) => host.hidePreview.set(true));
    expect(row.textContent).not.toContain('I kept replaying');

    const untitled = setup((host) => {
      host.hidePreview.set(true);
      host.title.set(null);
    });
    expect(untitled.title().textContent).toContain('Untitled');
    expect(untitled.row.textContent).not.toContain('I kept replaying');
  });

  it('adds the kind tag and the draft progress', () => {
    const { row } = setup((host) => {
      host.showKind.set(true);
      host.draftPart.set(3);
    });
    expect(row.querySelector('app-kind-tag')!.textContent).toContain('Reflection');
    expect(row.textContent).toContain('Draft · 3 of 6');
  });
});

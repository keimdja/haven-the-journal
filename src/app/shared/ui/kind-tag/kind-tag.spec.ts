import { TestBed } from '@angular/core/testing';

import type { EntryKind } from '../../../core/data/models';
import { KindTag } from './kind-tag';

function render(kind: EntryKind) {
  const fixture = TestBed.createComponent(KindTag);
  fixture.componentRef.setInput('kind', kind);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('KindTag', () => {
  it('marks reflections in lavender with the dot motif', () => {
    const host = render('reflection');
    expect(host.textContent).toContain('Reflection');
    expect(host.className).toContain('text-lavender-text');
    expect(host.querySelectorAll('[aria-hidden="true"] span')).toHaveLength(6);
  });

  it('marks free writing plainly', () => {
    const host = render('free');
    expect(host.textContent).toContain('Free writing');
    expect(host.className).toContain('text-ink-soft');
    expect(host.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

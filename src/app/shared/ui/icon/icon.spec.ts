import { TestBed } from '@angular/core/testing';

import { Icon } from './icon';
import { ICONS } from './icons';

function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(Icon);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  return { host, svg: host.querySelector('svg')!, path: host.querySelector('path')! };
}

describe('Icon', () => {
  it('draws the named icon at the given size', () => {
    const { svg, path } = render({ name: 'home', size: 24 });
    expect(path.getAttribute('d')).toBe(ICONS.home.d);
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
  });

  it('is hidden from screen readers by default', () => {
    const { host } = render({ name: 'check' });
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('becomes a labelled image when given a label', () => {
    const { host } = render({ name: 'close', label: 'Close' });
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Close');
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });

  it('fills solid icons instead of stroking them', () => {
    const { svg } = render({ name: 'six-dots' });
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.getAttribute('stroke')).toBeNull();
  });
});

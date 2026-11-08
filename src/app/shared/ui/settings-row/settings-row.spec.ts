import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SectionLabel } from '../section-label/section-label';
import { SettingsRow } from './settings-row';

@Component({
  imports: [SectionLabel, SettingsRow],
  template: `
    <h2 appSectionLabel>Account</h2>
    <app-settings-row id="static" label="Email" value="k@example.com" />
    <a app-settings-row id="link" href="/" label="Finding support" [chevron]="true"></a>
    <button
      app-settings-row
      id="danger"
      label="Delete account"
      icon="trash"
      [danger]="true"
    ></button>
    <app-settings-row #row id="slot" label="Hide previews">
      <span id="control" [attr.aria-labelledby]="row.labelId"></span>
    </app-settings-row>
  `,
})
class Host {}

describe('SettingsRow', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return (selector: string) => root.querySelector(selector)!;
  }

  it('shows a label with a read-only value, without hover', () => {
    const row = setup()('#static');
    expect(row.textContent).toContain('Email');
    expect(row.textContent).toContain('k@example.com');
    expect(row.className).not.toContain('hover:bg-cream');
  });

  it('works on a link with a chevron and a hover', () => {
    const row = setup()('#link');
    expect(row.querySelector('app-icon')).not.toBeNull();
    expect(row.className).toContain('hover:bg-cream');
    expect(row.hasAttribute('type')).toBe(false);
  });

  it('makes a red action button with its icon', () => {
    const row = setup()('#danger');
    expect(row.getAttribute('type')).toBe('button');
    expect(row.className).toContain('text-error');
    expect(row.querySelector('app-icon')).not.toBeNull();
  });

  it('lets a control inside be named by the row label', () => {
    const query = setup();
    const labelId = query('#control').getAttribute('aria-labelledby')!;
    expect(query(`#${labelId}`).textContent).toBe('Hide previews');
  });

  it('styles section labels', () => {
    expect(setup()('h2').className).toContain('uppercase');
  });
});

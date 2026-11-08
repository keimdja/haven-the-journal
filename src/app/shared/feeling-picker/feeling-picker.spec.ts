import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { FeelingKey } from '../../core/data/feelings';
import { CUSTOM_FEELINGS_MAX } from '../../core/data/feelings';
import { FeelingPicker } from './feeling-picker';

@Component({
  imports: [FeelingPicker],
  template: `
    <app-feeling-picker
      [alwaysOpen]="alwaysOpen()"
      [(feelings)]="feelings"
      [(customFeelings)]="custom"
    />
  `,
})
class Host {
  readonly alwaysOpen = signal(false);
  readonly feelings = signal<FeelingKey[]>([]);
  readonly custom = signal<string[]>([]);
}

describe('FeelingPicker', () => {
  beforeEach(() => localStorage.clear());

  function setup(changes: (host: Host) => void = () => {}) {
    const fixture = TestBed.createComponent(Host);
    changes(fixture.componentInstance);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(root.querySelectorAll('button'));
    const press = (label: string) => {
      buttons()
        .find((button) => button.textContent?.trim() === label)!
        .click();
      fixture.detectChanges();
    };
    const add = (text: string) => {
      const input = root.querySelector('input')!;
      input.value = text;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, root, buttons, press, add };
  }

  it('offers to add a feeling when none are chosen', () => {
    const { root } = setup();
    expect(root.textContent).toContain('Add a feeling');
    expect(root.querySelector('input')).toBeNull();
  });

  it('shows what’s chosen when closed, heavier ones in clay', () => {
    const { root } = setup((host) => {
      host.feelings.set(['calm', 'anxious']);
      host.custom.set(['Embarrassed']);
    });
    expect(root.textContent).toContain('Edit feelings');
    const tags = Array.from(root.querySelectorAll('app-chip span.inline-flex'));
    expect(tags.map((tag) => tag.textContent?.trim())).toEqual(['Calm', 'Anxious', 'Embarrassed']);
    expect(tags[1].className).toContain('bg-clay-tint');
  });

  it('opens to the 14 presets and closes again', () => {
    const { root, press } = setup();
    press('Add a feeling');
    expect(root.querySelectorAll('button[aria-pressed]')).toHaveLength(14);

    press('Done');
    expect(root.querySelectorAll('button[aria-pressed]')).toHaveLength(0);
  });

  it('keeps chosen feelings in preset order, and can unchoose them', () => {
    const { host, press } = setup((h) => h.alwaysOpen.set(true));
    press('Sad');
    press('Calm');
    expect(host.feelings()).toEqual(['calm', 'sad']);

    press('Calm');
    expect(host.feelings()).toEqual(['sad']);
  });

  it('is open from the start, with no Done, when alwaysOpen', () => {
    const { root, buttons } = setup((h) => h.alwaysOpen.set(true));
    expect(root.querySelectorAll('button[aria-pressed]')).toHaveLength(14);
    expect(buttons().some((button) => button.textContent?.trim() === 'Done')).toBe(false);
    expect(root.textContent).not.toContain('How does this feel?');
  });

  it('adds your own on Enter, trimmed and clears the field', () => {
    const { host, root, add } = setup((h) => h.alwaysOpen.set(true));
    add('  Embarrassed ');
    expect(host.custom()).toEqual(['Embarrassed']);
    expect(root.querySelector('input')!.value).toBe('');
  });

  it('ignores blanks and repeats, in any capitalization', () => {
    const { host, add } = setup((h) => h.alwaysOpen.set(true));
    add('Embarrassed');
    add('   ');
    add('embarrassed');
    expect(host.custom()).toEqual(['Embarrassed']);
  });

  it('cuts your own to 40 characters', () => {
    const { host, add } = setup((h) => h.alwaysOpen.set(true));
    add('x'.repeat(50));
    expect(host.custom()[0]).toHaveLength(40);
  });

  it('removes your own with its × button', () => {
    const { host, root, fixture } = setup((h) => {
      h.alwaysOpen.set(true);
      h.custom.set(['Embarrassed', 'Small']);
    });
    root.querySelector<HTMLButtonElement>('button[aria-label="Remove Embarrassed"]')!.click();
    fixture.detectChanges();
    expect(host.custom()).toEqual(['Small']);
  });

  it('stops offering the field at the limit', () => {
    const { root } = setup((h) => {
      h.alwaysOpen.set(true);
      h.custom.set(Array.from({ length: CUSTOM_FEELINGS_MAX }, (_, i) => `Feeling ${i}`));
    });
    expect(root.querySelector('input')).toBeNull();
    expect(root.textContent).toContain('as many as one entry can hold');
  });
});

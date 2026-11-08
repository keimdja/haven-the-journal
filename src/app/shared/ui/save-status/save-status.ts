import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icons';

/** Where the current entry's latest change is. */
export type SaveState = 'saving' | 'saved' | 'offline' | 'error';

interface StateView {
  readonly text: string;
  readonly icon?: IconName;
  readonly tone: string;
}

/** English for now; moves to the copy files with i18n. */
const STATES: Record<SaveState, StateView> = {
  saving: { text: 'Saving…', tone: 'text-ink-soft' },
  saved: { text: 'Saved', icon: 'check', tone: 'text-ink-soft' },
  offline: { text: 'Offline — saved on this device', icon: 'cloud-off', tone: 'text-ink-soft' },
  error: { text: 'Couldn’t save.', icon: 'alert', tone: 'text-error' },
};

/**
 * The quiet line in the editor and reflection headers that says whether your
 * writing is safe. A polite live region, so screen readers hear changes without
 * being interrupted. In the error state it offers "Try again" (`retry`).
 */
@Component({
  selector: 'app-save-status',
  imports: [Icon],
  template: `
    @if (view().icon; as icon) {
      <app-icon
        [class]="state() === 'saved' ? 'text-olive' : ''"
        [name]="icon"
        [size]="14"
        [strokeWidth]="state() === 'saved' ? 2 : 1.8"
      />
    } @else {
      <span
        class="mx-1 size-1.5 animate-pulse rounded-full bg-taupe-soft"
        aria-hidden="true"
      ></span>
    }
    {{ view().text }}
    @if (state() === 'error') {
      <button
        type="button"
        class="-my-2 py-2 font-semibold text-error underline underline-offset-2 hover:text-error-deep"
        (click)="retry.emit()"
      >
        Try again
      </button>
    }
  `,
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[class]': '"inline-flex items-center gap-1.5 text-meta " + view().tone',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveStatus {
  readonly state = input.required<SaveState>();
  readonly retry = output<void>();

  protected readonly view = computed(() => STATES[this.state()]);
}

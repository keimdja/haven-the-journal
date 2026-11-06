import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Stage = 'done' | 'current' | 'ahead';

const STAGE_CLASS: Record<Stage, string> = {
  done: 'bg-olive',
  current: 'bg-sage',
  ahead: 'bg-divider',
};

/**
 * The thin segmented bar under the reflection header: parts before the current
 * one are olive, the current one sage, the rest still ahead.
 */
@Component({
  selector: 'app-stage-bar',
  template: `
    @for (stage of stages(); track $index) {
      <span class="h-0.75 rounded-xs" [class]="stageClass[stage]"></span>
    }
  `,
  host: {
    class: 'grid auto-cols-fr grid-flow-col gap-1.5',
    role: 'progressbar',
    'aria-valuemin': '1',
    '[attr.aria-valuemax]': 'total()',
    '[attr.aria-valuenow]': 'current()',
    '[attr.aria-label]': 'label()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageBar {
  /** The part being written, from 1. */
  readonly current = input.required<number>();
  readonly total = input(6);
  readonly label = input('Reflection progress');

  protected readonly stageClass = STAGE_CLASS;
  protected readonly stages = computed<Stage[]>(() =>
    Array.from({ length: this.total() }, (_, i) => {
      const part = i + 1;
      return part < this.current() ? 'done' : part === this.current() ? 'current' : 'ahead';
    }),
  );
}

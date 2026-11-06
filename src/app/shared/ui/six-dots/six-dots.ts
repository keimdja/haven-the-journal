import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Six small dots showing how far a draft reflection has got: `filled` olive
 * dots, then empty taupe rings. Decorative, so always put the same progress
 * in text beside it ("Reflection · 3 of 6").
 */
@Component({
  selector: 'app-six-dots',
  template: `
    @for (isFilled of dots(); track $index) {
      <span
        class="size-1.5 rounded-full"
        [class]="isFilled ? 'bg-olive' : 'border border-taupe'"
      ></span>
    }
  `,
  host: { class: 'inline-flex gap-1', 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SixDots {
  /** How many parts are done, 0 to 6. */
  readonly filled = input(0);

  protected readonly dots = computed(() => Array.from({ length: 6 }, (_, i) => i < this.filled()));
}

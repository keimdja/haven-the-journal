import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BrandMarkSize = 'sm' | 'md' | 'lg';

/**
 * Per size, from the boards. Larger marks get a thinner stroke and a smaller
 * dot (in the 64-unit grid) so they look the same weight on screen.
 */
const SIZES = {
  sm: { mark: 24, stroke: 4.4, dot: 3.4, gap: 'gap-2', wordmark: 'text-[19px]' },
  md: { mark: 36, stroke: 3.8, dot: 3, gap: 'gap-3', wordmark: 'text-[24px]' },
  lg: { mark: 42, stroke: 3.6, dot: 2.8, gap: 'gap-3.5', wordmark: 'text-[30px]' },
} as const;

/**
 * The Doorway mark, optionally with the "Haven." wordmark and "The Journal" tagline.
 * The whole lockup reads as one image named "Haven" (or "Haven, The Journal").
 */
@Component({
  selector: 'app-brand-mark',
  template: `
    <svg
      class="shrink-0 text-olive"
      viewBox="0 0 64 64"
      [attr.width]="config().mark"
      [attr.height]="config().mark"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="config().stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 54V29a14 14 0 0 1 28 0v25M10 54h44" />
      <circle class="fill-clay" cx="32" cy="41" [attr.r]="config().dot" stroke="none" />
    </svg>

    @if (wordmark()) {
      <span class="flex flex-col gap-0.75" aria-hidden="true">
        <span class="font-reflect leading-none text-ink" [class]="config().wordmark">
          Haven<span class="text-clay">.</span>
        </span>
        @if (tagline()) {
          <span class="text-[9.5px] font-medium uppercase leading-none tracking-[0.22em] text-ink-soft">
            The Journal
          </span>
        }
      </span>
    }
  `,
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[class]': '"inline-flex items-center " + config().gap',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMark {
  readonly size = input<BrandMarkSize>('sm');
  /** Show "Haven." next to the mark. */
  readonly wordmark = input(true);
  /** Show "The Journal" under the wordmark (needs `wordmark`). */
  readonly tagline = input(false);

  protected readonly config = computed(() => SIZES[this.size()]);
  protected readonly label = computed(() =>
    this.wordmark() && this.tagline() ? 'Haven, The Journal' : 'Haven',
  );
}

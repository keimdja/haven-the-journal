import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** One block of the styleguide: a heading, an optional note, then the states side by side. */
@Component({
  selector: 'app-styleguide-section',
  template: `
    <section class="flex flex-col gap-4 border-t border-hairline pt-6">
      <header class="flex flex-col gap-1">
        <h2 class="font-reflect text-option">{{ heading() }}</h2>
        @if (note()) {
          <p class="text-meta text-ink-soft">{{ note() }}</p>
        }
      </header>
      <div class="flex flex-wrap items-start gap-6">
        <ng-content />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleguideSection {
  readonly heading = input.required<string>();
  readonly note = input<string>();
}

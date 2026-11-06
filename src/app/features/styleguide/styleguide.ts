import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StyleguideSection } from './styleguide-section';

/**
 * Dev-only page showing every shared UI component in every state, to compare
 * against the "Foundations & tokens" board. Each new component adds a section here.
 */
@Component({
  selector: 'app-styleguide',
  imports: [StyleguideSection],
  template: `
    <main class="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <header class="flex flex-col gap-2">
        <p class="text-label uppercase text-ink-soft">Haven · Design foundations v1</p>
        <h1 class="font-reflect text-greeting">Styleguide</h1>
        <p class="text-ink-soft">Every shared component in every state. Development builds only.</p>
      </header>

      <app-styleguide-section heading="Type" note="Fraunces for reflection, DM Sans for interface.">
        <div class="flex flex-col gap-3">
          <p class="font-reflect text-display">Good evening, K.</p>
          <p class="font-reflect text-question">What did I feel?</p>
          <p class="font-reflect text-entry-title">Sunday at Abuela's</p>
          <p class="font-reflect text-writing">I want to remember that this is possible on an ordinary day.</p>
          <p class="font-reflect text-prompt italic text-ink-muted">Was there a thought that kept coming back?</p>
          <p>Six gentle questions to look at a moment more closely.</p>
          <p class="text-label uppercase text-ink-soft">Pick up where you left off</p>
        </div>
      </app-styleguide-section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Styleguide {}

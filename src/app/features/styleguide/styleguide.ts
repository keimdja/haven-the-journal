import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { ICON_NAMES } from '../../shared/ui/icon/icons';
import { StyleguideSection } from './styleguide-section';

/**
 * Dev-only page showing every shared UI component in every state, to compare
 * against the "Foundations & tokens" board. Each new component adds a section here.
 */
@Component({
  selector: 'app-styleguide',
  imports: [BrandMark, Button, Icon, StyleguideSection],
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
          <p class="font-reflect text-writing">
            I want to remember that this is possible on an ordinary day.
          </p>
          <p class="font-reflect text-prompt italic text-ink-muted">
            Was there a thought that kept coming back?
          </p>
          <p>Six gentle questions to look at a moment more closely.</p>
          <p class="text-label uppercase text-ink-soft">Pick up where you left off</p>
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Brand mark"
        note="Doorway mark. sm for the Home header, md for first visit and the sidebar, lg for login."
      >
        <app-brand-mark />
        <app-brand-mark size="md" [tagline]="true" />
        <app-brand-mark size="lg" [tagline]="true" />
        <app-brand-mark size="lg" [wordmark]="false" />
      </app-styleguide-section>

      <app-styleguide-section
        heading="Buttons"
        note="One primary per screen. Danger only inside confirmations."
      >
        <button appButton>Continue</button>
        <button appButton="secondary">Keep as draft</button>
        <button appButton="quiet"><app-icon name="arrow-left" [size]="18" />Back</button>
        <button appButton="link">Skip for now</button>
        <button appButton="danger">Delete</button>
        <button appButton [disabled]="true">Disabled</button>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Wide buttons"
        note="Fill the row at 50 px, as on the delete sheet and the review step."
      >
        <div class="flex w-full max-w-sm flex-col gap-3">
          <button appButton [wide]="true">Save reflection</button>
          <a appButton="secondary" href="#" [wide]="true">Keep entry</a>
          <button appButton="danger" [wide]="true">Delete</button>
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Icons"
        note="24 × 24 grid, 1.6 stroke, coloured by the text colour around them."
      >
        @for (name of iconNames; track name) {
          <figure class="flex w-20 flex-col items-center gap-2 text-ink">
            <app-icon [name]="name" [size]="24" />
            <figcaption class="text-stamp text-ink-soft">{{ name }}</figcaption>
          </figure>
        }
      </app-styleguide-section>

      <app-styleguide-section
        heading="Icon sizes and colours"
        note="16, 20 and 24 px; olive and clay through text colour."
      >
        <div class="flex items-center gap-4 text-ink">
          <app-icon name="pen" [size]="16" />
          <app-icon name="pen" />
          <app-icon name="pen" [size]="24" />
        </div>
        <div class="flex items-center gap-4">
          <app-icon class="text-olive" name="six-dots" [size]="22" />
          <app-icon class="text-olive" name="check" [size]="14" [strokeWidth]="2" />
          <app-icon class="text-clay-text" name="trash" />
        </div>
      </app-styleguide-section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Styleguide {
  protected readonly iconNames = ICON_NAMES;
}

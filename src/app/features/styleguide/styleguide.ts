import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { Button } from '../../shared/ui/button/button';
import { CheckRow } from '../../shared/ui/check-row/check-row';
import { Chip } from '../../shared/ui/chip/chip';
import { Icon } from '../../shared/ui/icon/icon';
import { SegmentedControl } from '../../shared/ui/segmented-control/segmented-control';
import { SixDots } from '../../shared/ui/six-dots/six-dots';
import { StageBar } from '../../shared/ui/stage-bar/stage-bar';
import { Switch } from '../../shared/ui/switch/switch';
import { TextField, TextFieldInput } from '../../shared/ui/text-field/text-field';
import { ICON_NAMES } from '../../shared/ui/icon/icons';
import { StyleguideSection } from './styleguide-section';

/**
 * Dev-only page showing every shared UI component in every state, to compare
 * against the "Foundations & tokens" board. Each new component adds a section here.
 */
@Component({
  selector: 'app-styleguide',
  imports: [
    BrandMark,
    Button,
    CheckRow,
    Chip,
    Icon,
    SegmentedControl,
    SixDots,
    StageBar,
    StyleguideSection,
    Switch,
    TextField,
    TextFieldInput,
  ],
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
        heading="Text fields"
        note="Default, error, reflect (entry title) and search. Focus shows the olive border and sage ring."
      >
        <div class="flex w-full max-w-sm flex-col gap-5">
          <app-text-field label="Email">
            <input appInput type="email" placeholder="you@example.com" />
          </app-text-field>
          <app-text-field label="Email" error="That email looks incomplete.">
            <input appInput type="email" value="k@example" />
          </app-text-field>
          <app-text-field label="Give it a name" hint="(optional)" [reflect]="true">
            <input appInput type="text" value="The meeting with Ana" placeholder="Untitled" />
          </app-text-field>
          <app-text-field label="Search your entries" variant="search">
            <input appInput type="search" placeholder="Search your entries" />
          </app-text-field>
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Chips"
        note="Tags for chosen feelings: sage for lighter, clay for heavier. Custom feelings are light and removable."
      >
        <div class="flex flex-wrap gap-1.5">
          <app-chip label="Calm" />
          <app-chip label="Relieved, later" />
          <app-chip label="Anxious" weight="heavy" />
          <app-chip label="Frustrated" weight="heavy" />
          <app-chip label="Embarrassed" [removable]="true" />
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Feeling toggles"
        note="Pick any, or none. Chosen ones get the sage fill and a check."
      >
        <div class="flex flex-wrap gap-2">
          <app-chip label="Calm" [toggle]="true" [pressed]="true" />
          <app-chip label="Content" [toggle]="true" [pressed]="true" />
          <app-chip label="Hopeful" [toggle]="true" />
          <app-chip label="Tired" [toggle]="true" />
          <app-chip label="Lonely" [toggle]="true" />
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Check rows"
        note="Thinking patterns in part 4. The whole row toggles; checked rows get the sage wash."
      >
        <div class="flex w-full max-w-md flex-col border-t border-hairline">
          <app-check-row label="Predicting the future" example="“This is going to go badly.”" />
          <app-check-row label="Reading minds" example="“They must think I’m…”" [checked]="true" />
          <app-check-row label="Feelings as facts" example="“I feel it, so it must be true.”" />
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Segmented control and switch"
        note="Settings only. The chosen segment is lifted onto paper; arrow keys move between segments."
      >
        <div class="flex w-full max-w-sm flex-col gap-6">
          <app-segmented-control label="Language" [options]="languages" [(value)]="language" />
          <div class="flex items-center justify-between gap-4">
            <span class="flex flex-col gap-0.75">
              <span id="sg-hide">Hide previews on Home</span>
              <span class="text-meta text-ink-soft">Show titles only, not what you wrote.</span>
            </span>
            <app-switch labelledBy="sg-hide" [(checked)]="hidePreviews" />
          </div>
          <p class="text-meta text-ink-soft">
            Language: {{ language() }} · Hide previews: {{ hidePreviews() ? 'on' : 'off' }}
          </p>
        </div>
      </app-styleguide-section>

      <app-styleguide-section
        heading="Progress"
        note="Stage bar in the reflection header (done · current · ahead); six dots on draft reflections."
      >
        <div class="flex w-full max-w-sm flex-col gap-5">
          <app-stage-bar [current]="1" />
          <app-stage-bar [current]="2" />
          <app-stage-bar [current]="6" />
          <span class="flex items-center gap-2.5 text-meta text-ink-soft">
            <app-six-dots [filled]="3" />
            Reflection · 3 of 6 · Saturday
          </span>
          <span class="flex items-center gap-2.5 text-meta text-ink-soft">
            <app-six-dots [filled]="5" />
            Reflection · 5 of 6
          </span>
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

  protected readonly languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ] as const;
  protected readonly language = signal<'en' | 'es'>('en');
  protected readonly hidePreviews = signal(false);
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EntriesRepo } from '../../core/data/entries-repo';
import { entryLink, entryPreview } from '../../core/data/entry-summary';
import { ProfileStore } from '../../core/data/profile-store';
import { formatLongDate } from '../../core/i18n/format-date';
import { greeting } from '../../core/i18n/greeting';
import { I18n } from '../../core/i18n/i18n';
import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { EntryRow } from '../../shared/ui/entry-row/entry-row';
import { SectionLabel } from '../../shared/ui/section-label/section-label';
import { EmptyState } from './empty-state/empty-state';
import { ResumeCard } from './resume-card/resume-card';
import { StartOptions } from './start-options/start-options';

/** Where you land: today's date, a greeting, the ways to begin, and what's recent. */
@Component({
  selector: 'app-home',
  imports: [BrandMark, EmptyState, EntryRow, ResumeCard, RouterLink, SectionLabel, StartOptions],
  templateUrl: './home.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly i18n = inject(I18n);
  private readonly profile = inject(ProfileStore).profile;
  private readonly repo = inject(EntriesRepo);
  private readonly now = new Date();

  protected readonly t = this.i18n.t;
  protected readonly link = entryLink;
  protected readonly preview = entryPreview;
  protected readonly draft = this.repo.newestDraft;
  protected readonly recent = this.repo.recent;
  /** The welcome is only for an account with nothing in it, once that's known for sure. */
  protected readonly firstVisit = computed(
    () => this.repo.loaded() && this.repo.all().length === 0,
  );
  protected readonly hidePreviews = computed(() => this.profile()?.hidePreviews ?? false);

  protected readonly date = computed(() => formatLongDate(this.now, this.i18n.locale()));
  protected readonly hello = computed(() =>
    greeting(this.now, this.t(), this.profile()?.displayName),
  );
}

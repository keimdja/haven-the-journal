import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { EntriesRepo } from '../../../core/data/entries-repo';
import type { Entry } from '../../../core/data/models';
import { I18n } from '../../../core/i18n/i18n';
import { BottomSheet } from '../../../shared/ui/bottom-sheet/bottom-sheet';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';

/** "Delete this entry" at the foot of an entry, and the sheet that confirms it. */
@Component({
  selector: 'app-delete-entry',
  imports: [BottomSheet, Button, Icon, RouterLink],
  templateUrl: './delete-entry.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteEntry {
  readonly entry = input.required<Entry>();

  private readonly repo = inject(EntriesRepo);
  private readonly router = inject(Router);
  protected readonly t = inject(I18n).t;

  protected readonly confirming = signal(false);

  protected async confirm(): Promise<void> {
    this.confirming.set(false);
    await this.repo.remove(this.entry().id);
    await this.router.navigateByUrl('/journal', { replaceUrl: true });
  }
}

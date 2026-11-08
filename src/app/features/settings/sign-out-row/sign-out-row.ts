import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { SignOutFlow } from '../../../core/auth/sign-out';
import { I18n } from '../../../core/i18n/i18n';
import { BottomSheet } from '../../../shared/ui/bottom-sheet/bottom-sheet';
import { Button } from '../../../shared/ui/button/button';
import { SettingsRow } from '../../../shared/ui/settings-row/settings-row';

/**
 * The Sign out row in Settings. It syncs first; if anything still couldn't go
 * up, it asks in a sheet before erasing this device's copy.
 */
@Component({
  selector: 'app-sign-out-row',
  imports: [BottomSheet, Button, SettingsRow],
  templateUrl: './sign-out-row.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOutRow {
  private readonly flow = inject(SignOutFlow);
  protected readonly t = inject(I18n).t;

  protected readonly busy = signal(false);
  protected readonly warning = signal(false);

  protected async start(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      if (await this.flow.hasUnsyncedChanges()) this.warning.set(true);
      else await this.flow.finish();
    } finally {
      this.busy.set(false);
    }
  }

  protected async confirm(): Promise<void> {
    this.warning.set(false);
    await this.flow.finish();
  }
}

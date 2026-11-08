import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18n } from '../../core/i18n/i18n';
import { Pwa } from '../../core/pwa/pwa';

/** A quiet line near the bottom of any screen when a new version is ready. */
@Component({
  selector: 'app-update-prompt',
  templateUrl: './update-prompt.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePrompt {
  protected readonly pwa = inject(Pwa);
  protected readonly t = inject(I18n).t;
}

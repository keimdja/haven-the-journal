import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { I18n } from '../../../core/i18n/i18n';
import { Icon } from '../../../shared/ui/icon/icon';

/** The two ways to begin: a band of rows on phones, two tiles from 1024 px. */
@Component({
  selector: 'app-start-options',
  imports: [Icon, RouterLink],
  templateUrl: './start-options.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartOptions {
  protected readonly t = inject(I18n).t;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SignOutRow } from './sign-out-row/sign-out-row';

/** Language, account, privacy and your journal. Placeholder until the screen is built. */
@Component({
  selector: 'app-settings',
  imports: [SignOutRow],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}

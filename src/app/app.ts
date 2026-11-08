import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { UpdatePrompt } from './layout/update-prompt/update-prompt';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UpdatePrompt],
  template: '<router-outlet /><app-update-prompt />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

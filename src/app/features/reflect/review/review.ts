import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Read the reflection back, name it and save. Placeholder until the screen is built. */
@Component({
  selector: 'app-review',
  templateUrl: './review.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Review {}

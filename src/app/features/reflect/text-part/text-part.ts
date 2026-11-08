import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

import { I18n } from '../../../core/i18n/i18n';
import { Icon } from '../../../shared/ui/icon/icon';
import { Nudges } from '../nudges/nudges';

/** A written reflection part (1, 2, 5, 6): the question, nudges and the page. Bind `[(value)]`. */
@Component({
  selector: 'app-text-part',
  imports: [Icon, Nudges],
  templateUrl: './text-part.html',
  host: { class: 'flex min-h-0 flex-1 flex-col gap-4 pb-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPart {
  readonly question = input.required<string>();
  readonly helper = input.required<string>();
  readonly nudges = input.required<readonly string[]>();
  readonly value = model('');

  protected readonly t = inject(I18n).t;
  private readonly page = viewChild.required<ElementRef<HTMLTextAreaElement>>('page');

  /** Adds the prompt as a new line and puts the cursor after it, ready to answer. */
  protected insert(prompt: string): void {
    const current = this.value().trimEnd();
    this.value.set(`${current ? `${current}\n\n` : ''}${prompt}\n`);
    const page = this.page().nativeElement;
    page.focus();
    queueMicrotask(() => page.setSelectionRange(page.value.length, page.value.length));
  }
}

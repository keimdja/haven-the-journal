import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

import {
  CUSTOM_FEELINGS_MAX,
  CUSTOM_FEELING_MAX_LENGTH,
  FEELINGS,
  FEELING_KEYS,
  FeelingKey,
  feelingWeight,
} from '../../core/data/feelings';
import { I18n } from '../../core/i18n/i18n';
import { Chip } from '../ui/chip/chip';
import { Icon } from '../ui/icon/icon';
import { TextField, TextFieldInput } from '../ui/text-field/text-field';

/**
 * Choosing feelings, for the editor and reflection part 3. Bind `[(feelings)]`
 * and `[(customFeelings)]`; it holds no data of its own.
 *
 * Closed, it shows what's chosen and a button to change it. Open, it offers the
 * 14 presets and an "Add your own" field. `alwaysOpen` skips the closed view.
 * Feelings you type are kept exactly as written and never translated.
 */
@Component({
  selector: 'app-feeling-picker',
  imports: [Chip, Icon, TextField, TextFieldInput],
  templateUrl: './feeling-picker.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeelingPicker {
  readonly feelings = model<FeelingKey[]>([]);
  readonly customFeelings = model<string[]>([]);
  readonly alwaysOpen = input(false);

  protected readonly t = inject(I18n).t;
  protected readonly presets = FEELINGS;
  protected readonly weightOf = feelingWeight;
  protected readonly maxLength = CUSTOM_FEELING_MAX_LENGTH;

  private readonly expanded = signal(false);
  protected readonly isOpen = computed(() => this.alwaysOpen() || this.expanded());
  protected readonly isEmpty = computed(
    () => this.feelings().length === 0 && this.customFeelings().length === 0,
  );
  protected readonly atLimit = computed(() => this.customFeelings().length >= CUSTOM_FEELINGS_MAX);

  protected setExpanded(open: boolean): void {
    this.expanded.set(open);
  }

  protected isChosen(key: FeelingKey): boolean {
    return this.feelings().includes(key);
  }

  /** Keeps chosen feelings in the presets' order, whatever order they were tapped in. */
  protected setChosen(key: FeelingKey, chosen: boolean): void {
    const next = new Set(this.feelings());
    if (chosen) next.add(key);
    else next.delete(key);
    this.feelings.set(FEELING_KEYS.filter((feeling) => next.has(feeling)));
  }

  /** Adds what's typed, trimmed. A repeat (in any capitalization) is quietly ignored. */
  protected addCustom(field: HTMLInputElement, event: Event): void {
    event.preventDefault();
    if ((event as KeyboardEvent).isComposing) return;
    const feeling = field.value.trim().slice(0, CUSTOM_FEELING_MAX_LENGTH);
    field.value = '';
    if (!feeling || this.atLimit()) return;
    const repeat = this.customFeelings().some(
      (existing) => existing.toLocaleLowerCase() === feeling.toLocaleLowerCase(),
    );
    if (!repeat) this.customFeelings.update((list) => [...list, feeling]);
  }

  protected removeCustom(feeling: string): void {
    this.customFeelings.update((list) => list.filter((existing) => existing !== feeling));
  }
}

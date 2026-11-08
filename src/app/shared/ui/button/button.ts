import { Directive, ElementRef, computed, inject, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'link' | 'danger';

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-control no-underline transition-colors ' +
  'disabled:pointer-events-none disabled:opacity-50';

/** Colours and padding per variant, from the boards and the Foundations sheet. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'px-5.5 bg-olive font-semibold text-ivory hover:bg-olive-deep',
  secondary: 'px-5.5 border border-taupe-line font-semibold text-ink hover:bg-cream',
  quiet: 'px-3.5 font-medium text-ink hover:bg-cream',
  link: 'min-h-11 px-1.5 text-sm font-medium text-olive hover:text-olive-deep',
  danger: 'px-5.5 bg-error font-semibold text-paper hover:bg-error-deep',
};

/** 48 px inline, 50 px when it fills its row. Links size to their text (44 px tap area). */
const HEIGHT = { inline: 'h-12', wide: 'h-12.5 w-full' };

/**
 * Haven's buttons, applied to a native <button> or <a> so they keep their own
 * behaviour (keyboard, links, forms):
 *
 *   <button appButton (click)="save()">Save</button>
 *   <a appButton="quiet" routerLink="/">Back</a>
 *
 * `wide` makes it fill its row at 50 px tall, as on the confirmation sheets.
 * A <button> defaults to type="button" so it never submits a form by accident.
 */
@Directive({
  selector: 'button[appButton], a[appButton]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'isButton ? type() : null',
  },
})
export class Button {
  /** The variant; a bare `appButton` attribute means primary. */
  readonly variant = input<ButtonVariant, ButtonVariant | ''>('primary', {
    alias: 'appButton',
    transform: (value) => value || 'primary',
  });
  readonly wide = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const height = variant === 'link' ? '' : this.wide() ? HEIGHT.wide : HEIGHT.inline;
    return `${BASE} ${VARIANTS[variant]} ${height}`;
  });
}

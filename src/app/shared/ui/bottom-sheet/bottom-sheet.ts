import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';

let nextId = 0;

/**
 * A sheet that slides up from the bottom for confirmations (delete an entry,
 * sign out with unsynced changes). Bind `[(open)]`; put the body text and the
 * buttons inside.
 *
 * Built on a native <dialog> opened with showModal(), so the browser traps
 * focus inside it, makes the page behind it inert, and closes it on Esc.
 * Tapping the dimmed backdrop closes it too. Put `autofocus` on the safe choice
 * ("Keep entry") so that's where focus lands when it opens.
 */
@Component({
  selector: 'app-bottom-sheet',
  template: `
    <dialog
      #dialog
      class="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none translate-y-full overflow-y-auto rounded-t-sheet bg-paper p-0 text-ink shadow-overlay transition-[translate,display,overlay] transition-discrete duration-300 ease-out open:translate-y-0 starting:open:translate-y-full backdrop:bg-[rgb(46_45_39/0.42)] sm:mx-auto sm:max-w-lg"
      [attr.role]="alert() ? 'alertdialog' : null"
      [attr.aria-labelledby]="headingId"
      (close)="open.set(false)"
      (click)="$event.target === dialog && dialog.close()"
    >
      <div class="flex flex-col gap-3.5 px-6 pt-3 pb-[calc(2.25rem+env(safe-area-inset-bottom))]">
        <span class="mb-2.5 h-1 w-9 self-center rounded-xs bg-handle" aria-hidden="true"></span>
        <h2 class="font-reflect text-[24px] leading-tight" [id]="headingId">{{ heading() }}</h2>
        <ng-content />
      </div>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheet {
  readonly open = model(false);
  readonly heading = input.required<string>();
  /** Use for confirmations that need an answer, like deleting. */
  readonly alert = input(false);

  protected readonly headingId = `bottom-sheet-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Keep the native dialog in step with `open`, whichever side changed it.
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) dialog.showModal();
      if (!this.open() && dialog.open) dialog.close();
    });
  }
}

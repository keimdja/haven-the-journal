import { Directive } from '@angular/core';

/**
 * The small uppercase label that opens a section ("RECENTLY", "LANGUAGE").
 * Put it on whichever heading fits the page outline:
 *
 *   <h2 appSectionLabel>Recently</h2>
 */
@Directive({
  selector: '[appSectionLabel]',
  host: { class: 'text-label font-medium text-ink-soft uppercase' },
})
export class SectionLabel {}

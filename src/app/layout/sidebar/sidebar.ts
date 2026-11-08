import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { Icon } from '../../shared/ui/icon/icon';
import { NAV_ITEMS } from '../nav-items';

/**
 * The desktop navigation down the left side: the brand lockup (a link home),
 * the same three sections as the tab bar, and the privacy note at the bottom.
 * The current section gets `aria-current="page"`, which also gives it the sage fill.
 */
@Component({
  selector: 'app-sidebar',
  imports: [BrandMark, Icon, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly items = NAV_ITEMS;
}

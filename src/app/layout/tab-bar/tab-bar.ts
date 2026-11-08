import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Icon } from '../../shared/ui/icon/icon';
import { NAV_ITEMS } from '../nav-items';

/**
 * The mobile navigation along the bottom: Home · Journal · Settings. The current
 * section gets `aria-current="page"`, which also drives its olive colour and the
 * sage pill behind the icon. Leaves room for the iPhone home indicator.
 */
@Component({
  selector: 'app-tab-bar',
  imports: [Icon, RouterLink, RouterLinkActive],
  templateUrl: './tab-bar.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBar {
  protected readonly items = NAV_ITEMS;
}

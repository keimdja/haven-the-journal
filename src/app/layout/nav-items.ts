import type { Copy } from '../core/i18n/copy/en';
import { IconName } from '../shared/ui/icon/icons';

export interface NavItem {
  readonly path: string;
  /** Which `nav` label in the copy names this section. */
  readonly label: Exclude<keyof Copy['nav'], 'label'>;
  readonly icon: IconName;
  /** Home is only active on "/" itself, not on every page under it. */
  readonly exact: boolean;
}

/** The three main sections, shared by the tab bar and the desktop sidebar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'home', icon: 'home', exact: true },
  { path: '/journal', label: 'journal', icon: 'journal', exact: false },
  { path: '/settings', label: 'settings', icon: 'settings', exact: false },
];

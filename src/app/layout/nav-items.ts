import { IconName } from '../shared/ui/icon/icons';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: IconName;
  /** Home is only active on "/" itself, not on every page under it. */
  readonly exact: boolean;
}

/** The three main sections, shared by the tab bar and the desktop sidebar. English until i18n. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Home', icon: 'home', exact: true },
  { path: '/journal', label: 'Journal', icon: 'journal', exact: false },
  { path: '/settings', label: 'Settings', icon: 'settings', exact: false },
];

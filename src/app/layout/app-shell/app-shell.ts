import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { TabBar } from '../tab-bar/tab-bar';

/**
 * The frame around the main sections (Home, Journal, Settings): the tab bar
 * along the bottom on phones and tablets, the sidebar on the left from 1024 px,
 * and the page in <main> between them. Screens that need the whole screen
 * (editor, reflection, entry, login) are routed outside it.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, TabBar],
  templateUrl: './app-shell.html',
  host: { class: 'flex min-h-dvh' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {}

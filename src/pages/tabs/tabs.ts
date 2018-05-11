import { Component } from '@angular/core';
import { RepModePage } from '../rep-mode/rep-mode';
import { ManualControlPage } from '../manual-control/manual-control';
import { HelpPage } from '../help/help';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = RepModePage;
  tab2Root = ManualControlPage;
  tab3Root = HelpPage;

  constructor() {

  }
}

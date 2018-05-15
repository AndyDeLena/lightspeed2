import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { RepModePage } from '../pages/rep-mode/rep-mode';
import { ManualControlPage } from '../pages/manual-control/manual-control';
import { HelpPage } from '../pages/help/help';
import { BluetoothPage } from '../pages/bluetooth/bluetooth';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = BluetoothPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      {title: 'Bluetooth Connect', component: BluetoothPage},
      { title: 'Reps Mode', component: RepModePage },
      { title: 'Manual Control', component: ManualControlPage },
      { title: 'Help', component: HelpPage}
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}

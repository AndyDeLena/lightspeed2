import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';

import { DataProvider } from '../providers/data/data';


declare let cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'RepModePage';

  pages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform, public modalCtrl: ModalController, public dataService: DataProvider, public statusBar: StatusBar, public splashScreen: SplashScreen, public keyboard: Keyboard) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Bluetooth Connect', component: 'BluetoothPage' },
      { title: 'Reps Mode', component: 'RepModePage' },
      { title: 'Manual Control', component: 'ManualControlPage' },
      { title: 'Settings', component: 'SettingsPage'},
      { title: 'Help', component: 'HelpPage' }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.keyboard.hideKeyboardAccessoryBar(false);

      this.dataService.initialize();

      cordova.plugins.BluetoothStatus.initPlugin();


      setTimeout(() => {
        this.openPage({ title: 'Bluetooth Connect', component: 'BluetoothPage' });
      }, 250);
    });
  }

  openPage(page) {
    if(page.title == "Bluetooth Connect"){
      let modal = this.modalCtrl.create(page.component);
      modal.present();
    } else {
      this.nav.setRoot(page.component);
    }
  }
}

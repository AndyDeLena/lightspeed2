import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { RepModePage } from '../rep-mode/rep-mode';

@Component({
  selector: 'page-bluetooth',
  templateUrl: 'bluetooth.html',
})
export class BluetoothPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  done(): void {
    this.navCtrl.setRoot(RepModePage);
  }



}

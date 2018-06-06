import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from "../../providers/data/data";

import { ConnectionProvider } from '../../providers/connection/connection';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController, public connection: ConnectionProvider, public navParams: NavParams, public dataService: DataProvider) {
  }

  update() {
    this.connection.updateSystemLength(this.dataService.maxSystemLength);
  }
  
}



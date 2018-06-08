import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from "../../providers/data/data";
import { AlertsProvider } from '../../providers/alerts/alerts';
import { ConnectionProvider } from '../../providers/connection/connection';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  nodesPerYard: number
  maxSystemLength: string

  maxOptions: Array<string> = []

  constructor(public navCtrl: NavController, public alerts: AlertsProvider, public connection: ConnectionProvider, public navParams: NavParams, public dataService: DataProvider) {
    this.nodesPerYard = this.dataService.savedData.nodesPerYard;
    this.maxSystemLength = this.dataService.savedData.maxSystemLength;
    for(let i = 2.5; i <= 100; i+=2.5){
      this.maxOptions.push(i + " yards")
    }
  }

  update() {
    this.dataService.updateNodesPerYard(this.nodesPerYard);
    this.dataService.updateMaxSystemLength(this.maxSystemLength);

    this.connection.refreshAllConnections().then(res => {
      this.alerts.okAlert("Success", "Settings have been updated.");
    }).catch(err => {
      this.alerts.okAlert("Error", "Error while updating. Please try again.");
    })
  }

}



import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataProvider } from "../../providers/data/data";
import { AlertsProvider } from '../../providers/alerts/alerts';
import { ConnectionProvider } from '../../providers/connection/connection';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  nodesPerYard: number;
  maxDistance: string;

  constructor(public navCtrl: NavController, public alerts: AlertsProvider, public navParams: NavParams, public dataService: DataProvider) {
    this.nodesPerYard = this.dataService.savedData.nodesPerYard;
    this.maxDistance = this.dataService.savedData.maxDistance;
  }

  ionViewWillLeave() {
    this.dataService.savedData.nodesPerYard = this.nodesPerYard;
    this.dataService.savedData.maxDistance = this.maxDistance;
    this.dataService.setStorageObject();
  }

  updateNodesPerYard(event): void {
    if(this.dataService.repsList.length) {
      this.alerts.okAlert("Error", "In order to update this setting, please clear all reps from the list in Reps Mode.")
    } else {
      this.nodesPerYard = +event;
    }
  }

  updateMaxDistance(event): void {
    this.alerts.okCancelAlert("Warning", "Changing this setting requires you to restart your control box (unplug then re-connect power). Continue?", "Yes").then(res => {
      if(res == "OK"){
        this.maxDistance = event;
      }
    });
  }

  clearStorage(): void {
    this.dataService.clearStorage();
    this.alerts.okAlert("Success", "Storage has been cleared.");
  }
  

}

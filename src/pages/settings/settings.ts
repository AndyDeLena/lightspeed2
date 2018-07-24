import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';
import { DataProvider } from "../../providers/data/data";
import { AlertsProvider } from '../../providers/alerts/alerts';
import { ConnectionProvider } from '../../providers/connection/connection';
import { UtilitiesProvider } from '../../providers/utilities/utilities';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  nodesPerYard: number
  maxSystemLength: string
  chgDelay: string

  ssid: string
  password: string

  chgOptions: Array<string> = []
  maxOptions: Array<string> = []

  constructor(public navCtrl: NavController, public util: UtilitiesProvider, public alertCtrl: AlertController, public alerts: AlertsProvider, public connection: ConnectionProvider, public navParams: NavParams, public dataService: DataProvider) {
    this.nodesPerYard = this.dataService.savedData.nodesPerYard;
    this.maxSystemLength = this.dataService.savedData.maxSystemLength;
    this.chgDelay = this.dataService.savedData.chgDelay != undefined ? this.dataService.savedData.chgDelay.toFixed(1) + " sec" : "0.5 sec";
    this.ssid = this.dataService.savedData.ssid;
    this.password = this.dataService.savedData.password;

    for (let i = 2.5; i <= 100; i += 2.5) {
      this.maxOptions.push(i + " yards")
    }

    for (let j = 0; j < 3.1; j += 0.1) {
      this.chgOptions.push(j.toFixed(1) + " sec")
    }
  }

  ionViewWillLeave() {
    this.dataService.savedData.ssid = this.ssid
    this.dataService.savedData.password = this.password
    this.dataService.saveAll()
  }

  update() {
    this.dataService.updateNodesPerYard(+this.nodesPerYard);
    this.dataService.updateMaxSystemLength(this.maxSystemLength);
    this.dataService.updateChgDelay(this.chgDelay)

    this.connection.disconnectAll();
    this.alerts.okAlert("Success", "Settings have been updated. Please re-connect to the controller via the Bluetooth Connect screen for these changes to take effect.")
  }

  enableWifi(): void {
    if (!this.connection.activeBoxes.length) {
      this.alerts.okAlert("Error", "You must be connected via Bluetooth to at least one control box in order to send it Wifi info.")
      return
    }
    if (!this.ssid.length) {
      this.alerts.okAlert("Error", "Please enter a network name.")
    } else if (!this.password.length) {
      this.alerts.okAlert("Error", "Please enter a password.")
    } else {
      this.connection.enableWifi(this.ssid, this.password)
    }
  }

  versionCheck(): void {
    if (!this.connection.activeBoxes.length) {
      this.alerts.okAlert("Error", "You must be connected via Bluetooth to a control box in order to check its version.")
      return
    }
    if (this.connection.activeBoxes.length > 1) {
      this.alerts.okAlert("Error", "You can only be connected to one control box at a time if you wish to check its version.")
      return
    }
    this.connection.versionCheck().then(res => {
      this.alerts.okAlert("Version " + this.util.ab2str(res))
    })
  }
}



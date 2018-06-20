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

  chgOptions: Array<string> = []
  maxOptions: Array<string> = []

  constructor(public navCtrl: NavController, public util: UtilitiesProvider, public alertCtrl: AlertController, public alerts: AlertsProvider, public connection: ConnectionProvider, public navParams: NavParams, public dataService: DataProvider) {
    this.nodesPerYard = this.dataService.savedData.nodesPerYard;
    this.maxSystemLength = this.dataService.savedData.maxSystemLength;
    this.chgDelay = this.dataService.savedData.chgDelay ? this.dataService.savedData.chgDelay.toFixed(1) + " sec" : "0.5 sec";

    for (let i = 2.5; i <= 100; i += 2.5) {
      this.maxOptions.push(i + " yards")
    }

    for (let j = 0; j < 2; j += 0.1) {
      this.chgOptions.push(j.toFixed(1) + " sec")
    }
  }

  update() {
    this.dataService.updateNodesPerYard(+this.nodesPerYard);
    this.dataService.updateMaxSystemLength(this.maxSystemLength);
    this.dataService.updateChgDelay(this.chgDelay)

    this.connection.disconnectAll();
    this.alerts.okAlert("Success", "Settings have been updated. Please re-connect to the controller via the Bluetooth Connect screen for these changes to take effect.")
  }

  enableWifi(): void {
    let alert = this.alertCtrl.create({
      title: "Enable Updates",
      subTitle: "Please enter your wifi network name and password. This will enable your LightSpeed control box to connect to the internet and stay up to date with all the latest features.",
      inputs: [{
        type: "text",
        placeholder: "Network SSID...",
        name: "network"
      }, {
        type: "text",
        placeholder: "Password...",
        name: "password"
      }],
      buttons: [{
        text: "OK",
        handler: data => {
          if (!data.network.length) {
            this.alerts.okAlert("Error", "Please enter a network name.")
          } else if (!data.password.length) {
            this.alerts.okAlert("Error", "Please enter a password.")
          } else {
            this.connection.enableWifi(data)
          }
        }
      }, {
        text: "Cancel"
      }]
    })
    alert.present();
  }

  versionCheck(): void {
    this.connection.versionCheck().then(res => {
      this.alerts.okAlert("Version " + this.util.ab2str(res))
    })
  }
}



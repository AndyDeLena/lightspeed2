import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { ConnectionProvider } from '../../providers/connection/connection';
import { AlertsProvider } from '../../providers/alerts/alerts';

declare let cordova: any;


@Component({
  selector: 'page-bluetooth',
  templateUrl: 'bluetooth.html',
})
export class BluetoothPage {

  gooseEgg: boolean = false;
  scanning: boolean = false;

  buttonCaption: string = "Scan";

  bleNotSupported: boolean = false;
  bleNotEnabled: boolean = false;

  constructor(public viewCtrl: ViewController, public connection: ConnectionProvider, public alerts: AlertsProvider) {

  }

  ionViewDidLoad() {
    //Check bluetooth hardware state
    if (!cordova.plugins.BluetoothStatus.hasBTLE) {
      this.bleNotSupported = true;
    } else {
      if (!cordova.plugins.BluetoothStatus.BTenabled) {
        this.bleNotEnabled = true;
        window.addEventListener('BluetoothStatus.enabled', () => {
          this.bleNotEnabled = false;
          this.scan();
        });
      } else {
        this.scan();
      }
    }
    this.scan();
  }

  scan(): void {
    this.scanning = true;
    //reset variables if previous scan was attempted, but keep connected system in the list
    // (they won't 'respond' to scan if already connected)
    this.gooseEgg = false;
    this.connection.availableBoxes = [];

    if (this.connection.activeBoxes.length) {
      for (let box of this.connection.activeBoxes) {
        this.connection.availableBoxes.push({ name: box.name, id: box.id, connected: true });
      }
    }

    this.connection.scan().subscribe(device => {
      //don't add to availableControllers if already present
      for (let c of this.connection.availableBoxes) {
        if (c.name === device.name) {
          return;
        }
      }
      //not already present, push to array
      this.connection.availableBoxes.push({ name: device.name, id: device.id, connected: false });
    }, err => {
      this.alerts.okAlert('Error', 'An error occurred while scanning for LightSpeed systems');
      this.buttonCaption = "Scan Again";
      this.scanning = false;
      if (!this.connection.availableBoxes.length) {
        //no LightSpeed controllers were found. Display card and retry button to user
        this.gooseEgg = true;
      }
    }, () => {
      this.buttonCaption = "Scan Again";
      this.scanning = false;
      if (!this.connection.availableBoxes.length) {
        //no LightSpeed controllers were found. Display card and retry button to user
        this.gooseEgg = true;
      }
    });
  }

  connect(name, id): void {
    this.connection.connect(name, id);
  }

  disconnect(id): void {
    this.connection.disconnect(id);
  }

  done(): void {
    this.viewCtrl.dismiss();
  }

}

import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, Platform, Navbar } from 'ionic-angular';
import { WorkoutProvider } from '../../providers/workout/workout';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { ConnectionProvider } from '../../providers/connection/connection';
import { Insomnia } from '@ionic-native/insomnia';

@Component({
  selector: 'page-manual-control',
  templateUrl: 'manual-control.html'
})
export class ManualControlPage {
  @ViewChild(Navbar) navBar: Navbar;

  unregisterHwBackButton: any;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public workout: WorkoutProvider, public util: UtilitiesProvider, public alerts: AlertsProvider,
    public connection: ConnectionProvider, public modalCtrl: ModalController, public insomnia: Insomnia, public platform: Platform) {

  }

  ionViewDidLoad() {
    this.insomnia.keepAwake();

    if (this.platform.is('ios')) {
      this.iosBackButtonAction();
    } else {
      this.androidHwBackButtonAction();
    }
  }

  ionViewWillLeave() {
    this.insomnia.allowSleepAgain();

    // Unregister the custom back button action for this page
    this.unregisterHwBackButton && this.unregisterHwBackButton();
  }

  //**************************************************//
  //************** SHARED FUNCTIONS ******************//
  //**************************************************//

  iosBackButtonAction(): void {
    //custom back button logic for this page b/c user might want to save splits
    this.navBar.backButtonClick = () => {
      //this.back();
    }
  }

  androidHwBackButtonAction(): void {
    this.unregisterHwBackButton = this.platform.registerBackButtonAction(() => {
      //this.back();
    });
  }

 openPage(page): void {
   this.navCtrl.push(page);
 }

  openBluetooth(): void {
    let modal = this.modalCtrl.create("BluetoothPage");
    modal.present();
  }

}

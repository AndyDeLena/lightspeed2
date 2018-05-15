import { Component } from '@angular/core';
import { NavController, Platform, ModalController, ActionSheetController } from 'ionic-angular';

@Component({
  selector: 'page-rep-mode',
  templateUrl: 'rep-mode.html',
})
export class RepModePage {

  constructor(public navCtrl: NavController, public platform: Platform, public modalCtrl: ModalController, public actionCtrl: ActionSheetController) {
  }

  openRepModal(): void {
    let modal = this.modalCtrl.create("AddRepPage");
    modal.present();
  }

  startWorkout(): void {
    this.navCtrl.push("RepDashboardPage");
  }

  openActionSheet(): void {
    let as = this.actionCtrl.create({
      title: "Options",
      buttons: [
        {
          text: "Save this workout",
          icon: !this.platform.is('ios') ? 'folder' : null
        },
        {
          text: "Load a saved workout",
          icon: !this.platform.is('ios') ? 'code-download' : null,
        },
        {
          text: "Delete a saved workout",
          role: "destructive",
          icon: !this.platform.is('ios') ? 'trash' : null,
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        }
      ]
    });
    as.present();
  }

}

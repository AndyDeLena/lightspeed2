import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { WorkoutProvider } from '../../providers/workout/workout';

@IonicPage()
@Component({
  selector: 'page-rep-dashboard',
  templateUrl: 'rep-dashboard.html',
})
export class RepDashboardPage {

  configButton: string = "Hide";
  configHidden: boolean = false;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public workout: WorkoutProvider, public navParams: NavParams) {
  }

  showHideConfig(): void {
    if(this.configButton == "Hide"){
      this.configButton = "Show";
      this.configHidden = true;
    } else {
      this.configButton = "Hide";
      this.configHidden = false;
    }
  }

  editRep(rep): void {
    let modal = this.modalCtrl.create("AddRepPage", { editing: rep });
    modal.present();
  }


  

}

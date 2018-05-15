import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-rep-dashboard',
  templateUrl: 'rep-dashboard.html',
})
export class RepDashboardPage {

  configButton: string = "Hide";
  configHidden: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
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

  

}

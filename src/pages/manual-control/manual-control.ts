import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@Component({
  selector: 'page-manual-control',
  templateUrl: 'manual-control.html'
})
export class ManualControlPage {
  
  constructor(public navCtrl: NavController) {

  }

  openPage(page): void {
    this.navCtrl.push(page);
  }

}

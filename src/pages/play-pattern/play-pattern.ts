import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-play-pattern',
  templateUrl: 'play-pattern.html',
})
export class PlayPatternPage {

  savedPatterns: Array<string> = [];
  patternName: string = "";
  patternType: string = "";

  delayType: string = "Constant";

  forwardSpeed: number = 0;
  backwardSpeed: number = 0;
  chgDelay: number = 0;

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  playing: boolean = false;

  constructor(public navCtrl: NavController, public dataService: DataProvider, public alerts: AlertsProvider, public platform: Platform, public navParams: NavParams, public util: UtilitiesProvider, public actionCtrl: ActionSheetController) {
    this.savedPatterns = this.dataService.savedData.contents.savedPatterns;
  }

  checkSpeedDataTypes(): void {
    if (typeof (this.forwardSpeed) == 'string') {
      this.forwardSpeed = parseFloat(this.forwardSpeed);
    }
    if (typeof (this.backwardSpeed) == 'string') {
      this.backwardSpeed = parseFloat(this.backwardSpeed);
    }
    if (typeof (this.chgDelay) == 'string') {
      this.chgDelay = parseFloat(this.chgDelay);
    }
  }

  patternNameUpdated(newName): void {
    if (newName.length) {
      this.patternType = this.dataService.savedData.savedPatterns[this.patternName].type;
    } else {
      this.patternType = "";
    }
  }

  increment(direction): void {
    this.checkSpeedDataTypes();

    if (direction == 'fwd') {
      this.forwardSpeed = parseFloat((this.forwardSpeed += 0.1).toFixed(1));
    } else if (direction == 'bwd') {
      this.backwardSpeed = parseFloat((this.backwardSpeed += 0.1).toFixed(1));
    } else {
      this.chgDelay = parseFloat((this.chgDelay += 0.1).toFixed(1));
    }
  }

  decrement(direction): void {
    if (direction == 'fwd') {
      this.forwardSpeed = parseFloat((this.forwardSpeed -= 0.1).toFixed(1));
    } else if (direction == 'bwd') {
      this.backwardSpeed = parseFloat((this.backwardSpeed -= 0.1).toFixed(1));
    } else {
      this.chgDelay = parseFloat((this.chgDelay -= 0.1).toFixed(1));
    }

    if (this.forwardSpeed < 0) {
      this.forwardSpeed = 0;
    }
    if (this.backwardSpeed < 0) {
      this.backwardSpeed = 0;
    }
    if (this.chgDelay < 0) {
      this.chgDelay = 0;
    }
  }

  togglePlaying(): void {
    this.playing = !this.playing;
  }

  removePattern(): void {
    let self = this;
    this.alerts.okCancelAlert('Remove Type', 'Are you sure you want to remove ' + self.patternName + '?', 'Yes').then(res => {
      if (res == 'OK') {
        this.dataService.removeObject('savedPatterns', this.patternName);
        this.patternName = "";
        this.patternType = "";
        this.savedPatterns = this.dataService.savedData.contents.savedPatterns;
      }
    });
  }

  openActionSheet(): void {
    let as = this.actionCtrl.create({
      title: "Options",
      buttons: [
        {
          text: "Remove " + this.patternName + " from saved patterns",
          role: "destructive",
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => { this.removePattern() }
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

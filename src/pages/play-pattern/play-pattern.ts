import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { AlertsProvider } from '../../providers/alerts/alerts';

@IonicPage()
@Component({
  selector: 'page-play-pattern',
  templateUrl: 'play-pattern.html',
})
export class PlayPatternPage {

  patternName: string = "";
  selectedPatternType: string = "";
  patternKeys: Array<string> = [];

  patterns: any = {"Example 1": {type: "static"}, "Example 2": {type: "dynamic"}};

  delayType: string = "Constant";

  forwardSpeed: number = 0;
  backwardSpeed: number = 0;
  chgDelay: number = 0;

  speedUnitOptions: Array<string> = [];

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  playing: boolean = false;

  constructor(public navCtrl: NavController, public alerts: AlertsProvider, public platform: Platform, public navParams: NavParams, public util: UtilitiesProvider, public actionCtrl: ActionSheetController) {
    this.speedUnitOptions = this.util.speedUnitOptions;
    this.patternKeys = Object.keys(this.patterns);
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

  patternNameUpdate(event): void {
    this.selectedPatternType = this.patterns[event].type;
  }

  removePattern(): void {
    let self = this;
    this.alerts.okCancelAlert('Remove Type', 'Are you sure you want to remove ' + self.patternName + '?','Yes').then(res => {
      if(res == 'OK'){
        delete self.patterns[self.patternName];
        
        this.patternKeys = Object.keys(this.patterns);
        if(!this.patternKeys.length){
          this.selectedPatternType = "";
        } else {
          this.selectedPatternType = this.patternKeys[0];
        }
      }
    });
  }

  openActionSheet(): void {
    let as = this.actionCtrl.create({
      title: "Options",
      buttons: [
        {text: "Remove " + this.patternName + " from saved patterns",
         role: "destructive",
         icon: !this.platform.is('ios') ? 'trash' : null,
         handler: ()=>{this.removePattern()}},
        {text: 'Cancel',
         role: 'cancel',
         icon: !this.platform.is('ios') ? 'close' : null}
      ]
    });
    as.present();
  }




}

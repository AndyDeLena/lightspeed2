import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';

@IonicPage()
@Component({
  selector: 'page-random-pattern',
  templateUrl: 'random-pattern.html',
})
export class RandomPatternPage {

  availableColors: Array<string> = ['red', 'green', 'blue'];
  selectedColor: string = "red";


  staticOrDynamic: string = "static";
  
  delayType: string = "Constant";

  forwardSpeed: number = 0;
  backwardSpeed: number = 0;
  chgDelay: number = 0;

  speedUnitOptions: Array<string> = [];

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  playing: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.speedUnitOptions = this.util.speedUnitOptions;

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



}

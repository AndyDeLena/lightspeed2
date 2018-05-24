import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { DataProvider } from '../../providers/data/data';
import { ConnectionProvider } from '../../providers/connection/connection';
import { AlertsProvider } from '../../providers/alerts/alerts';

@IonicPage()
@Component({
  selector: 'page-random-pattern',
  templateUrl: 'random-pattern.html',
})
export class RandomPatternPage {

  colors: Array<string> = [];
  selectedColor: string = "red";

  staticOrDynamic: string = "static";

  duration: number = null;

  delayType: string = "Constant";
  constDelay: number = null;
  minDelay: number = null;
  maxDelay: number = null;

  forwardSpeed: number = null;
  backwardSpeed: number = null;
  chgDelay: number = null;

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  playing: boolean = false;

  playTimeout: any = null;

  constructor(public navCtrl: NavController, public alerts: AlertsProvider, public connection: ConnectionProvider, public dataService: DataProvider, public navParams: NavParams, public util: UtilitiesProvider) {
    this.colors = this.dataService.colors;
  }

  ionViewDidLoad() {
    this.dataService.updateSystemLength(this.dataService.savedData.systemLength);
  }

  public convertToNumber(event): number { return +event; }

  play(): void {
    this.playing = true;

    let len = this.util.stringToNum(this.dataService.savedData.systemLength) * 2;
    let sec = this.dataService.savedData.numSections;
    let interval = len / sec;

    if (this.staticOrDynamic == "static") {
      this.playStatic(interval);
    } else {
      this.playDynamic(len, interval);
    }
  }

  playStatic(interval): void {
    let valid = this.validateStatic();
    if (!valid) {
      this.playing = false;
      return;
    }

    let node;
    let cmd;
    let wait;

    let endTime = Date.now() + (this.duration * 1000);

    let internalCallback = () => {
      if (Date.now() > endTime) {
        this.stop();
        return;
      }
      node = Math.floor(Math.random() * (0 - interval) + interval);
      cmd = this.util.buildStaticCommands(this.selectedColor, node, interval);
      console.log(cmd);
      this.connection.write(cmd).then(res => {
        console.log(res);
      }).catch(err => {
        this.stop();
        this.alerts.okAlert("Error", "Error communicating with LED controller. Please try again.");
        return;
      });
      wait = this.delayType == "Constant" ? this.constDelay * 1000 : (Math.random() * (this.minDelay - this.maxDelay) + this.maxDelay) * 1000;
      this.playTimeout = setTimeout(() => {
        internalCallback();
      }, wait);
    }
    internalCallback();
  }

  playDynamic(len, interval): void {
    let valid = this.validateDynamic();
    if (!valid) {
      this.playing = false;
      return;
    }

    let cmd;
    let wait;

    let speeds = {
      Forward: this.util.speedToMsDelay(this.forwardSpeed, this.forwardSpeedUnit),
      Backward: this.util.speedToMsDelay(this.backwardSpeed, this.backwardSpeedUnit),
    }

    let direct = "Forward";

    let endTime = Date.now() + (this.duration * 1000);

    let internalCallback = () => {
      if (Date.now() > endTime) {
        this.stop();
        return;
      }

      if (direct == "Forward") {
        direct = "Backward";
      } else {
        direct = "Forward";
      }

      let chg = this.chgDelay ? this.chgDelay * 1000 : 0;
      cmd = this.util.buildDynamicCommands(this.selectedColor, interval, direct, speeds[direct], len, chg);
      console.log(cmd);
      this.connection.write(cmd).catch(err => {
        this.stop();
        this.alerts.okAlert("Error", "Error communicating with LED controller. Please try again.");
        return;
      });

      let s = interval / 5;
      wait = ((speeds[direct] * 5) * Math.floor(Math.random() * (1 - s) + s)) + chg;
      console.log(wait);
      this.playTimeout = setTimeout(() => {
        internalCallback();
      }, wait);
    }
    internalCallback();
  }

  validateStatic(): boolean {
    if (!this.duration) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for pattern duration.");
      return false;
    } else if (this.delayType == "Constant" && !this.constDelay) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for delay length.");
      return false;
    } else if (this.delayType == "Variable" && !this.minDelay) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for min delay.");
      return false;
    } else if (this.delayType == "Variable" && !this.maxDelay) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for max delay.");
      return false;
    } else if (this.minDelay > this.maxDelay) {
      this.alerts.okAlert("Form Invalid", "Max delay must be greater than min delay.");
      return false;
    }

    return true;
  }

  validateDynamic(): boolean {
    if (!this.duration) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for pattern duration.");
      return false;
    } else if (!this.forwardSpeed) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for forward speed.");
      return false;
    } else if (!this.backwardSpeed) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for backward speed.");
      return false;
    }

    return true;
  }

  stop(): void {
    clearTimeout(this.playTimeout);
    this.playing = false;
    this.connection.stopPattern();
  }

  updateSystemLength(newLength): void {
    this.dataService.updateSystemLength(newLength);
  }



}

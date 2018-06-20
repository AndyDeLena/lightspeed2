import { Component, ViewChild } from '@angular/core';
import { IonicPage, Navbar, ModalController, NavController, NavParams, Platform } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { DataProvider } from '../../providers/data/data';
import { ConnectionProvider } from '../../providers/connection/connection';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { Insomnia } from '@ionic-native/insomnia';

@IonicPage()
@Component({
  selector: 'page-random-pattern',
  templateUrl: 'random-pattern.html',
})
export class RandomPatternPage {
  @ViewChild(Navbar) navBar: Navbar;

  unregisterHwBackButton: any;

  colors: Array<string> = [];
  selectedColor: string = "green";

  staticOrDynamic: string = "static";

  duration: number = null;

  delayType: string = "Constant";
  constDelay: number = null;
  minDelay: number = null;
  maxDelay: number = null;

  forwardSpeed: number = null;
  backwardSpeed: number = null;

  startAt: string = "Beginning"

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  playing: boolean = false;

  playTimeout: any = null;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public platform: Platform, public insomnia: Insomnia, public alerts: AlertsProvider, public connection: ConnectionProvider, public dataService: DataProvider, public navParams: NavParams, public util: UtilitiesProvider) {
    this.colors = this.dataService.colors;
  }

  ionViewDidLoad() {
    this.dataService.updateSystemLength(this.dataService.savedData.systemLength);

    if (this.platform.is('ios')) {
      this.iosBackButtonAction();
    } else {
      this.androidHwBackButtonAction();
    }

    this.insomnia.keepAwake();

  }

  ionViewWillLeave() {
    this.insomnia.allowSleepAgain();

    // Unregister the custom back button action for this page
    this.unregisterHwBackButton && this.unregisterHwBackButton();
  }

  iosBackButtonAction(): void {
    //custom back button logic for this page b/c user might want to save splits
    this.navBar.backButtonClick = () => {
      this.done();
    }
  }

  androidHwBackButtonAction(): void {
    this.unregisterHwBackButton = this.platform.registerBackButtonAction(() => {
      this.done();
    });
  }

  done(): void {
    if (this.playing) {
      this.stop();
    }
    this.navCtrl.pop();
  }

  public convertToNumber(event): number { return +event; }

  play(): void {
    this.playing = true;

    if (this.staticOrDynamic == "static") {
      this.playStatic();
    } else {
      this.playDynamic();
    }
  }

  playStatic(): void {
    let valid = this.validateStatic();
    if (!valid) {
      this.playing = false;
      return;
    }

    let len = this.util.stringToNum(this.dataService.savedData.systemLength) * this.dataService.savedData.nodesPerYard;
    let sec = this.dataService.savedData.numSections;
    let interval = Math.floor(len / sec) + 1;

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
      cmd = this.util.buildStaticCommands(this.selectedColor, node, interval, len);
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

  playDynamic(): void {
    let valid = this.validateDynamic();
    if (!valid) {
      this.playing = false;
      return;
    }

    let speeds = {
      Forward: this.util.speedToMsDelay(this.forwardSpeed, this.forwardSpeedUnit),
      Backward: this.util.speedToMsDelay(this.backwardSpeed, this.backwardSpeedUnit),
    }

    //always start at beginning for now

    let dur = this.duration * 1000;

    let randDirect = Math.round(Math.random())
    let direct = randDirect ? "Forward" : "Backward"

    let segId = 0;
    let interval = this.dataService.savedData.numSections;
    let chg = this.dataService.savedData.chgDelay ? this.dataService.savedData.chgDelay * 1000 : 0;
    let maxNum = this.util.stringToNum(this.dataService.savedData.systemLength) / interval / 2.5
    let mirror = Math.floor((this.util.stringToNum(this.dataService.savedData.systemLength) / interval) * this.dataService.savedData.nodesPerYard)
    let starting;

    if (this.startAt == "Beginning") {
      starting = 0
    } else if (this.startAt == "Middle") {
      starting = mirror / 2
    } else {
      starting = mirror
    }

    let bleCmds = []

    do {
      let s = { segId: segId, direction: direct, startAt: starting, distance: 0, color: this.selectedColor, totalMs: 0, chgDelay: chg, mirror: mirror};
      let randSections = Math.round(Math.random() * (1 - maxNum) + maxNum);

      s.distance = Math.floor(randSections * this.dataService.savedData.nodesPerYard * 2.5);
      if (direct == "Forward") {
        if (s.startAt + s.distance > mirror) {
          s.distance = mirror - s.startAt
        }
      } else {
        s.startAt -= 1
        if (s.startAt - s.distance < 0) {
          s.distance = s.startAt
        }
      }
      if (s.distance == 0) {
        direct = direct == "Forward" ? "Backward" : "Forward"
        continue
      }

      let ms = speeds[direct] * s.distance;

      if (ms > dur) {
        s.totalMs = dur
        s.distance = Math.round(dur / speeds[direct])
      } else {
        s.totalMs = ms
      }

      bleCmds.push(this.util.buildDynamicCommands(s));

      starting = direct == "Forward" ? starting + s.distance : starting - s.distance
      direct = direct == "Forward" ? "Backward" : "Forward"
      segId++
      dur -= (s.totalMs + s.chgDelay)
    } while (dur > 0)


    this.connection.play(bleCmds);

    this.playTimeout = setTimeout(() => {
      clearTimeout(this.playTimeout);
      this.playing = false;
    }, this.duration * 1000);

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
    } else if (this.delayType == "Variable" && this.minDelay > this.maxDelay) {
      this.alerts.okAlert("Form Invalid", "Max delay must be greater than min delay.");
      return false;
    } else if (this.delayType == "Variable" && (this.minDelay < 0.5 || this.maxDelay < 0.5)) {
      this.alerts.okAlert("Form Invalid", "Minimum delay length is 0.5 seconds.");
      return false;
    } else if (this.delayType == 'Constant' && this.constDelay < 0.5) {
      this.alerts.okAlert("Form Invalid", "Minimum delay length is 0.5 seconds.");
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
    this.staticOrDynamic == "static" ? this.connection.stopPattern() : this.connection.stopDynamic()
  }

  updateSystemLength(newLength): void {
    this.dataService.updateSystemLength(newLength);
  }

  noBlePopup(): void {
    let bleModal = this.modalCtrl.create("BluetoothPage");
    bleModal.present();
  }


}

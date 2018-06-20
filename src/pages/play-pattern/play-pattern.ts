import { Component, ViewChild } from '@angular/core';
import { IonicPage, Navbar, ModalController, NavController, NavParams, ActionSheetController, Platform } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { DataProvider } from '../../providers/data/data';
import { ConnectionProvider } from '../../providers/connection/connection';
import { Insomnia } from '@ionic-native/insomnia';

@IonicPage()
@Component({
  selector: 'page-play-pattern',
  templateUrl: 'play-pattern.html',
})
export class PlayPatternPage {
  @ViewChild(Navbar) navBar: Navbar;

  unregisterHwBackButton: any;

  savedPatterns: Array<string> = [];
  patternName: string = "";
  patternType: string = "";

  delayType: string = "Constant";
  constDelay: number = null;
  minDelay: number = null;
  maxDelay: number = null;

  forwardSpeed: number = null;
  backwardSpeed: number = null;

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  playing: boolean = false;
  playTimeout: any = null;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public insomnia: Insomnia, public connection: ConnectionProvider, public dataService: DataProvider, public alerts: AlertsProvider, public platform: Platform, public navParams: NavParams, public util: UtilitiesProvider, public actionCtrl: ActionSheetController) {
    this.savedPatterns = this.dataService.savedData.contents.savedPatterns;
  }

  ionViewDidLoad() {
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


  patternNameUpdated(newName): void {
    if (newName.length) {
      this.patternType = this.dataService.savedData.savedPatterns[this.patternName].type;
    } else {
      this.patternType = "";
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

  play(): void {
    this.playing = true;

    if (this.patternType == "static") {
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

    let record = this.dataService.savedData.savedPatterns[this.patternName].record;
    let totalNodes = this.util.stringToNum(this.dataService.savedData.savedPatterns[this.patternName].systemLength) * this.dataService.savedData.nodesPerYard;
    let numSec = this.dataService.savedData.savedPatterns[this.patternName].numSections;

    let interval = totalNodes / numSec;

    let cmd;
    let wait;
    let i = 0;

    let internalCallback = () => {
      cmd = this.util.buildStaticCommands(record[i].color, record[i].id, interval, totalNodes);
      console.log(cmd);
      i++;

      this.connection.write(cmd);

      if (i == record.length) {
        setTimeout(() => {
          this.stop();
          return;
        }, wait)
      } else {
        wait = this.delayType == "Constant" ? this.constDelay * 1000 : (Math.random() * (this.minDelay - this.maxDelay) + this.maxDelay) * 1000;
        this.playTimeout = setTimeout(() => {
          internalCallback();
        }, wait);
      }
    }
    internalCallback();
  }

  playDynamic(): void {
    let valid = this.validateDynamic();
    if (!valid) {
      this.playing = false;
      return;
    }

    let record = this.dataService.savedData.savedPatterns[this.patternName].record;
    let totalNodes = this.util.stringToNum(this.dataService.savedData.savedPatterns[this.patternName].systemLength) * this.dataService.savedData.nodesPerYard;
    let numSec = this.dataService.savedData.savedPatterns[this.patternName].numSections;

    let interval = totalNodes / numSec;

    let chg = this.dataService.savedData.chgDelay ? this.dataService.savedData.chgDelay * 1000 : 0;

    let totalMs = 0;

    for (let i = 0; i < record.length; i++) {
      if (record[i + 1]) {
        if (record[i].direction == record[i + 1].direction) {
          record[i].chgDelay = 0
        } else {
          record[i].chgDelay = chg
        }
      } else {
        record[i].chgDelay = 0
      }

      if (record[i].direction == "Forward") {
        record[i].speed = this.forwardSpeed;
        record[i].speedUnit = this.forwardSpeedUnit;
      } else {
        record[i].speed = this.backwardSpeed;
        record[i].speedUnit = this.backwardSpeedUnit;
      }
      record[i].totalMs = this.util.speedToMsDelay(record[i].speed, record[i].speedUnit) * record[i].distance
      totalMs += record[i].totalMs + chg
    }

    let cmds = this.util.buildRecordedDynamic(record, interval, chg);

    console.log(cmds);

    this.connection.play(cmds);

    this.playTimeout = setTimeout(() => {
      clearTimeout(this.playTimeout);
      this.playing = false;
    }, totalMs);

  }

  validateStatic(): boolean {
    if (this.delayType == "Constant" && !this.constDelay) {
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
    if (!this.forwardSpeed) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for forward speed.");
      return false;
    } else if (!this.backwardSpeed) {
      this.alerts.okAlert("Form Invalid", "Please enter a value for backward speed.");
      return false;
    }

    return true;
  }

  stop(): void {
    this.patternType == 'static' ? this.connection.stopPattern() : this.connection.stopDynamic();
    clearTimeout(this.playTimeout);
    this.playing = false;
  }

  noBlePopup(): void {
    let bleModal = this.modalCtrl.create("BluetoothPage");
    bleModal.present();
  }

}

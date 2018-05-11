import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, Platform, Navbar } from 'ionic-angular';
import { WorkoutProvider } from '../../providers/workout/workout';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { ConnectionProvider } from '../../providers/connection/connection';
import { Insomnia } from '@ionic-native/insomnia';

@Component({
  selector: 'page-manual-control',
  templateUrl: 'manual-control.html'
})
export class ManualControlPage {
  @ViewChild(Navbar) navBar: Navbar;

  unregisterHwBackButton: any;

  configButton: string = "HIDE";
  configHidden: boolean = false;
  sysLenOptions: Array<string> = [];
  systemLength: string = "10 yards";
  numSectionsOptions: Array<number> = [1];
  numSections: number = 1;

  availableColors: Array<string> = ['red', 'green', 'blue'];
  selectedColor: string = "red";
  colorButtonsInactive: boolean = false;

  mode: string = "choose";
  lights: Array<{ id: number, active: boolean, color: string }> = [];

  recordOrPlay: string = "record";
  recordingDelayMode: string = "Constant";
  recording: boolean = false;
  savedPatterns: Array<string> = [];
  patternToPlay: string = "";

  randomDelayMode: string = "Constant";

  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public workout: WorkoutProvider, public util: UtilitiesProvider, public alerts: AlertsProvider,
    public connection: ConnectionProvider, public modalCtrl: ModalController, public insomnia: Insomnia, public platform: Platform) {

    this.initialize();

  }

  ionViewDidLoad() {
    this.insomnia.keepAwake();

    if (this.platform.is('ios')) {
      this.iosBackButtonAction();
    } else {
      this.androidHwBackButtonAction();
    }
  }

  ionViewWillLeave() {
    this.insomnia.allowSleepAgain();

    // Unregister the custom back button action for this page
    this.unregisterHwBackButton && this.unregisterHwBackButton();
  }
  //**************************************************//
  //************** SHARED FUNCTIONS ******************//
  //**************************************************//

  iosBackButtonAction(): void {
    //custom back button logic for this page b/c user might want to save splits
    this.navBar.backButtonClick = () => {
      //this.back();
    }
  }

  androidHwBackButtonAction(): void {
    this.unregisterHwBackButton = this.platform.registerBackButtonAction(() => {
      //this.back();
    });
  }

  initialize(): void {
    for (let i = 2.5; i <= 80; i += 2.5) {
      this.sysLenOptions.push(i + " yards");
    }
    this.updateSystemLength(this.systemLength);
  }

  showHideConfig(): void {
    if (this.configButton == "HIDE") {
      this.configButton = "SHOW";
      this.configHidden = true;
    } else {
      this.configButton = "HIDE";
      this.configHidden = false;
    }
  }

  updateSystemLength(newLength): void {
    this.numSectionsOptions = [];
    this.numSections = 1;
    let maxSections = this.sysLenOptions.indexOf(newLength) + 1;
    for (let i = 1; i <= maxSections; i++) {
      let x = (this.util.stringToNum(newLength) / i) % 2.5;
      if (!x) {
        this.numSectionsOptions.push(i);
      }
    }
    this.fillLights();
  }

  updateNumSections(): void {
    this.fillLights();
  }

  fillLights(): void {
    this.lights = [];
    let buttons = (this.util.stringToNum(this.systemLength) * 2) / this.numSections;  //2 LEDs per yard
    for (let i = 1; i <= buttons; i++) {
      this.lights.push({ id: i, active: false, color: 'dark' });
    }
  }

  selectColor(color): void {
    this.selectedColor = color;
  }

  outline(color): string {
    if (this.selectedColor == color) {
      return '4px solid black';
    } else {
      return '';
    }
  }

  modeChange(): void {
    this.configHidden = false;
    this.configButton = "HIDE";

    if (this.mode == "record" && this.recordOrPlay == "play") {
      this.colorButtonsInactive = true;
    } else {
      this.colorButtonsInactive = false;
    }
  }

  //**************************************************//
  //*************** PATTERN FUNCTIONS ****************//
  //**************************************************//

  activateLight(light): void {
    for (let l of this.lights) {
      this.deactivateLight(l);
    }
    light.active = true;
    light.color = this.selectedColor;
  }

  deactivateLight(light): void {
    light.active = false;
    light.color = "dark";
  }

  //**************************************************//
  //************** RECORDING FUNCTIONS ***************//
  //**************************************************//

  recordPlayChange(): void {
    if (this.recordOrPlay == "play") {
      this.colorButtonsInactive = true;
    } else {
      this.colorButtonsInactive = false;
    }
  }
  startRecording(): void {
    this.recording = true;
  }

  stopRecording(): void {
    this.recording = false;

    let prompt = this.alertCtrl.create({
      title: 'Save Pattern',
      message: 'What name would you like to save this pattern under?',
      inputs: [{
        name: 'saveName',
        placeholder: 'Name...'
      }],
      buttons: [{
        text: 'Cancel',
      }, {
        text: 'Save',
        handler: data => {
          this.savedPatterns.push(data.saveName);
        }
      }]
    });
    prompt.present();
  }

  playOptions(): void {
    if (!this.patternToPlay.length) {
      this.alerts.okAlert("Select a Pattern", "Please select a saved pattern above in order to see options.");
    } else {

      let prompt = this.alertCtrl.create({
        title: 'Options',
        subTitle: "Would you like to delete or rename this pattern?",
        buttons: [{
          text: "Delete"
        }, {
          text: "Rename"
        }, {
          text: "Cancel"
        }]
      });
      prompt.present();
    }
  }

}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';

@IonicPage()
@Component({
  selector: 'page-record-pattern',
  templateUrl: 'record-pattern.html',
})
export class RecordPatternPage {

  sysLenOptions: Array<string> = [];
  systemLength: string = "10 yards";
  numSectionsOptions: Array<number> = [1];
  numSections: number = 1;

  staticOrDynamic: string = "static";
  recordingDelayMode: string = "Constant";
  recording: boolean = false;
  savedPatterns: Array<string> = [];
  patternToPlay: string = "";

  availableColors: Array<string> = ['red', 'green', 'blue'];
  selectedColor: string = "red";

  playing: boolean = false;

  lights: Array<{ id: number, active: boolean, color: string }> = [];

  constructor(public navCtrl: NavController, public alerts: AlertsProvider, public alertCtrl: AlertController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.fillLights();
    this.initialize();
  }

  initialize(): void {
    for (let i = 2.5; i <= 80; i += 2.5) {
      this.sysLenOptions.push(i + " yards");
    }
    this.updateSystemLength(this.systemLength);
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

  fillLights(): void {
    this.lights = [];
    let buttons = (this.util.stringToNum(this.systemLength) * 2) / this.numSections;  //2 LEDs per yard
    for (let i = 1; i <= buttons; i++) {
      this.lights.push({ id: i, active: false, color: 'dark' });
    }
  }

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

  play(): void {
    this.playing = !this.playing;
  }


}

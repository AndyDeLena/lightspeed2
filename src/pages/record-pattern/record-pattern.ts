import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-record-pattern',
  templateUrl: 'record-pattern.html',
})
export class RecordPatternPage {

  staticOrDynamic: string = "static";
  recordingDelayMode: string = "Constant";
  recording: boolean = false;
  savedPatterns: Array<string> = [];
  patternToPlay: string = "";

  availableColors: Array<string> = ['red', 'green', 'blue'];
  selectedColor: string = "red";

  playing: boolean = false;

  lights: Array<{ id: number, active: boolean, color: string }> = [];
  cId: number = 0;

  record: Array<any> = [];

  dynamicRecordInterval: any = null;

  constructor(public navCtrl: NavController, public dataService: DataProvider, public alerts: AlertsProvider, public alertCtrl: AlertController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.fillLights();
  }

  ngOnChanges() {
    console.log("something changed");
  }

  updateSystemLength(newLength): void {
    this.dataService.updateSystemLength(newLength);
    this.fillLights();
  }

  on(): void {
    this.lights[this.cId].active = true;
    this.lights[this.cId].color = this.selectedColor;
  }

  off(): void {
    this.lights[this.cId].active = false;
    this.lights[this.cId].color = "bg-gray";
  }

  addToRecord(light): void {
    this.off();

    this.cId = light.id - 1;
    this.on();

    this.record.push({ id: this.cId, color: this.selectedColor });
    console.log(this.record);
  }

  deactivateInRecord(light): void {
    this.off();

    this.record.push({ id: this.cId, color: "off" });
    console.log(this.record);
  }

  forward(): void {
    clearInterval(this.dynamicRecordInterval);

    if (!this.record.length) {
      this.cId = 0;
    }

    this.on();
    this.record.push({ id: this.cId, color: this.selectedColor });

    this.dynamicRecordInterval = setInterval(() => {
      this.off();
      this.cId++;
      if (this.cId >= this.lights.length) {
        this.cId = this.lights.length - 1;
        this.on();
      } else {
        this.on();
        this.record.push({ id: this.cId, color: this.selectedColor });
        console.log(this.record);
      }
    }, 1000);
  }

  backward(): void {
    clearInterval(this.dynamicRecordInterval);

    if (!this.record.length) {
      this.cId = this.lights.length - 1;
    }

    this.on();
    this.record.push({ id: this.cId, color: this.selectedColor });

    this.dynamicRecordInterval = setInterval(() => {
      this.off();
      this.cId--;
      if (this.cId <= 0) {
        this.cId = 0;
        this.on();
      } else {
        this.on();
        this.record.push({ id: this.cId, color: this.selectedColor });
        console.log(this.record);
      }
    }, 1000);
  }

  startRecording(): void {
    this.record = [];

    this.recording = true;
  }

  stopRecording(): void {
    this.recording = false;

    clearInterval(this.dynamicRecordInterval);
    this.off();

    if (this.record.length) {
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
            let saveObj = { type: this.staticOrDynamic, systemLength: this.dataService.savedData.systemLength, numSections: this.dataService.savedData.numSections, record: this.record };
            this.dataService.saveObject('savedPatterns', data.saveName, saveObj);
          }
        }]
      });
      prompt.present();
    }
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
    let buttons = (this.util.stringToNum(this.dataService.savedData.systemLength) * 2) / this.dataService.savedData.numSections;  //2 LEDs per yard
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

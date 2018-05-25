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

  availableColors: Array<string> = ['red', 'green', 'blue'];
  selectedColor: string = "red";

  lights: Array<{ id: number, active: boolean, color: string }> = [];
  cId: number = 0;

  lastStartAt: number = 0;
  currentDirection: string = "Forward";

  record: Array<any> = [];

  dynamicRecordInterval: any = null;

  constructor(public navCtrl: NavController, public dataService: DataProvider, public alerts: AlertsProvider, public alertCtrl: AlertController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.fillLights();
  }

  ionViewDidLoad() {
    this.dataService.updateSystemLength(this.dataService.savedData.systemLength);
  }

  updateSystemLength(newLength): void {
    this.dataService.updateSystemLength(newLength);
    this.fillLights();
  }

  fillLights(): void {
    this.lights = [];
    let buttons = (this.util.stringToNum(this.dataService.savedData.systemLength) * 2) / this.dataService.savedData.numSections;  //2 LEDs per yard
    for (let i = 1; i <= buttons; i++) {
      this.lights.push({ id: i, active: false, color: 'dark' });
    }
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

  newSegment(): any {
    if (this.record.length) {
      let dist = Math.abs(this.cId - this.lastStartAt) + 1;
      this.record[this.record.length - 1].distance = dist;
    }
    this.lastStartAt = this.cId;

    let newSeg = {
      color: this.selectedColor,
      direction: this.currentDirection,
      startAt: this.cId,
      distance: "0 yards",
      speed: "0",
      speedUnit: "mph"
    }

    this.record.push(newSeg);
  }

  colorChange(color): void {
    this.selectedColor = color;
    if (this.recording && this.staticOrDynamic == 'dynamic') {
      if (this.cId != this.lastStartAt) {
        this.newSegment();
      }
    }
  }

  forward(): void {
    clearInterval(this.dynamicRecordInterval);

    if (!this.record.length) {
      this.cId = 0;
    }

    this.currentDirection = "Forward";

    this.newSegment();

    this.on();

    this.dynamicRecordInterval = setInterval(() => {
      this.off();
      this.cId++;
      if (this.cId >= this.lights.length) {
        this.cId = this.lights.length - 1;
        this.on();
      } else {
        this.on();
      }
    }, 1000);
  }

  backward(): void {
    clearInterval(this.dynamicRecordInterval);

    if (!this.record.length) {
      this.cId = this.lights.length - 1;
    }

    this.currentDirection = "Backward";

    this.newSegment();

    this.on();

    this.dynamicRecordInterval = setInterval(() => {
      this.off();
      this.cId--;
      if (this.cId <= 0) {
        this.cId = 0;
        this.on();
      } else {
        this.on();
      }
    }, 1000);
  }

  startRecording(): void {
    this.record = [];

    this.recording = true;
  }

  stopRecording(): void {
    this.recording = false;

    if (this.staticOrDynamic == 'dynamic' && this.record.length) {
      let dist = Math.abs(this.cId - this.lastStartAt) + 1;
      this.record[this.record.length - 1].distance = dist;
    }

    console.log(this.record);

    clearInterval(this.dynamicRecordInterval);
    this.off();

    let internal = () => {
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
              let exists = this.dataService.checkExists('savedPatterns', data.saveName);
              if (!exists) {
                let saveObj = { type: this.staticOrDynamic, systemLength: this.dataService.savedData.systemLength, numSections: this.dataService.savedData.numSections, record: this.record };
                this.dataService.saveObject('savedPatterns', data.saveName, saveObj);
              } else {
                this.alerts.okAlert("Naming Conflict", "A saved pattern with this name already exists. Please enter another.").then(() => {
                  internal();
                });
              }
            }
          }]
        });
        prompt.present();
      }
    }
    internal();
  }

}

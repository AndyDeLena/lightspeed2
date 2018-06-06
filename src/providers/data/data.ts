import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class DataProvider {

  colors: Array<string> = ['green', 'blue', 'red'];

  maxDistance: number = 100;
  distanceOptions: Array<string> = [];
  numSectionsOptions: Array<number> = [1];

  speedUnitOptions: Array<string> = ['mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h'];
  speedUnitOptionsWithSecs: Array<string> = ['sec', 'mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h'];


  //DATA FROM/TO STORAGE
  savedData: any;
  defaultSaveData: any;

  systemLength: string;
  numSections: number;

  //PREPROGRAMMED WOKROUT REP LIST
  repsList: Array<any> = [];

  constructor(public storage: Storage) {
    this.defaultSaveData = {
      contents: {
        savedRepTypes: [],
        savedWorkouts: [],
        savedPatterns: [],
      },
      savedRepTypes: {},
      savedWorkouts: {},
      savedPatterns: {},
      systemLength: '20 yards',
      numSections: 1,
      nodesPerYard: 9,
      maxDistance: '20 yards',
    };
  }


  initialize(): void {

    //INITIALIZE DISTANCE OPTIONS FOR ALL SELECT BOXES
    for (let i = 2.5; i <= this.maxDistance; i += 2.5) {
      this.distanceOptions.push(i + " yards");
    }

    //GET STORED DATA AND PREVOIUS SESSION DATA
    this.storage.get('savedData').then(data => {
      if (data) {
        this.savedData = data;
        this.systemLength = this.savedData.systemLength;
        this.numSections = this.savedData.numSections;

      } else {
        this.savedData = this.defaultSaveData;
        this.setStorageObject();
      }
    }).catch(err => {
      console.log("Error", err);
    });
  }

  stringToNum(str): number {
    return parseFloat(str.substring(0, str.indexOf(" ")));
  }

  setStorageObject(): void {
    this.storage.set('savedData', this.savedData).catch(err => {
      console.log("Error: ", err);
    });
  }

  clearStorage(): void {
    this.storage.clear();
    this.savedData = this.defaultSaveData;
    this.setStorageObject();
  }

  checkExists(object, key): boolean {
    if (this.savedData[object][key]) {
      return true;
    } else {
      return false;
    }
  }

  saveObject(object, key, data): void {
    this.savedData[object][key] = JSON.parse(JSON.stringify(data));

    this.savedData.contents[object] = Object.keys(this.savedData[object]);

    this.storage.set('savedData', this.savedData).catch(err => {
      console.log("Error: ", err);
    });
  }

  removeObject(object, key): void {
    delete this.savedData[object][key];

    this.savedData.contents[object] = Object.keys(this.savedData[object]);

    this.storage.set('savedData', this.savedData).catch(err => {
      console.log("Error: ", err);
    });
  }

  updateSystemLength(newLength): void {
    this.numSectionsOptions = [];

    this.savedData.systemLength = newLength;
    this.savedData.numSections = 1;

    let maxSections = this.distanceOptions.indexOf(newLength) + 1;
    for (let i = 1; i <= maxSections; i++) {
      let x = (this.stringToNum(newLength) / i) % 2.5;
      if (!x) {
        this.numSectionsOptions.push(i);
      }
    }
  }

}



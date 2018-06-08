import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class DataProvider {

  readonly sectionLength: number = 2.5 //group LED lights into sections of 2.5 yards
  readonly colors: Array<string> = ['green', 'blue', 'red']
  readonly speedUnitOptions: Array<string> = ['mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h']
  readonly speedUnitOptionsWithSecs: Array<string> = ['sec', 'mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h']

  maxDistance: number;
  distanceOptions: Array<string> = [];
  numSectionsOptions: Array<number> = [];

  //DATA FROM/TO STORAGE
  savedData: any = {
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
    maxSystemLength: '20 yards',
  };

  systemLength: string;
  numSections: number;

  nodesPerYard: number = 9;
  maxSystemLength: string = '20 yards';

  //PREPROGRAMMED WOKROUT REP LIST
  repsList: Array<any> = [];

  constructor(public storage: Storage) {
    this.initialize();
  }

  initialize(): void {

    this.storage.get('savedData').then(stored => {
      if (stored) {
        this.savedData = stored
        console.log(this.savedData)
      }

      this.updateMaxSystemLength(this.savedData.maxSystemLength)
      this.updateSystemLength(this.savedData.systemLength)

    }).catch(err => {
      console.error("error reading saved data from storage: ", err);
    
      this.updateMaxSystemLength(this.savedData.maxSystemLength)
      this.updateSystemLength(this.savedData.systemLength)
    })
  }

  stringToNum(str): number {
    return parseFloat(str.substring(0, str.indexOf(" ")));
  }

  checkExists(object, key): boolean {
    if (this.savedData[object][key]) {
      return true;
    } else {
      return false;
    }
  }

  saveAll(): void {
    this.storage.set('savedData', this.savedData);
    console.log(this.savedData)
  }

  saveObject(object, key, data): void {
    this.savedData[object][key] = JSON.parse(JSON.stringify(data));

    this.savedData.contents[object] = Object.keys(this.savedData[object]);

    /*this.storage.set('savedData', this.savedData).catch(err => {
      console.log("Error: ", err);
    });*/
  }

  removeObject(object, key): void {
    delete this.savedData[object][key];

    this.savedData.contents[object] = Object.keys(this.savedData[object]);

    /*this.storage.set('savedData', this.savedData).catch(err => {
      console.log("Error: ", err);
    });*/
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

  updateMaxSystemLength(newMax): void {
    if (newMax) {
      this.savedData.maxSystemLength = newMax
    }
    this.distanceOptions = [];
    for (let i = 2.5; i <= this.stringToNum(this.savedData.maxSystemLength); i += 2.5) {
      this.distanceOptions.push(i + " yards");
    }
  }

  updateNodesPerYard(newNodes): void {
    this.savedData.nodesPerYard = newNodes;
  }

}



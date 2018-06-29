import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertsProvider } from '../alerts/alerts';

@Injectable()
export class DataProvider {
  
  readonly version: string = "5.0.4"
  readonly sectionLength: number = 2.5 //group LED lights into sections of 2.5 yards
  readonly colors: Array<string> = ['green', 'blue', 'red']
  readonly speedUnitOptions: Array<string> = ['mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h']
  readonly speedUnitOptionsWithSecs: Array<string> = ['sec', 'mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h']

  maxDistance: number;
  distanceOptions: Array<string> = [];
  numSectionsOptions: Array<number> = [];

  //DATA FROM/TO STORAGE
  savedData: any = {}

  defaultData: any = {
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
      nodesPerYard: 2,
      maxSystemLength: '20 yards',
      chgDelay: 0.5
    };

  systemLength: string;
  numSections: number;

  nodesPerYard: number = 9;
  maxSystemLength: string = '20 yards';

  //PREPROGRAMMED WOKROUT REP LIST
  repsList: Array<any> = [];

  constructor(public storage: Storage, public alerts: AlertsProvider) {
    this.initialize();
  }

  initialize(): void {

    this.savedData = this.defaultData

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

    this.storage.set('savedData', this.savedData);
  }

  removeObject(object, key): void {
    delete this.savedData[object][key];

    this.savedData.contents[object] = Object.keys(this.savedData[object]);
    
    this.storage.set('savedData', this.savedData);
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
    this.storage.set('savedData', this.savedData);
  }

  updateMaxSystemLength(newMax): void {
    if (newMax) {
      this.savedData.maxSystemLength = newMax
    }
    this.distanceOptions = [];
    for (let i = 2.5; i <= this.stringToNum(this.savedData.maxSystemLength); i += 2.5) {
      this.distanceOptions.push(i + " yards");
    }
    this.storage.set('savedData', this.savedData);
  }

  updateNodesPerYard(newNodes): void {
    this.savedData.nodesPerYard = newNodes;
    this.storage.set('savedData', this.savedData);
  }

  updateChgDelay(newChg): void {
    this.savedData.chgDelay = this.stringToNum(newChg);
    this.storage.set('savedData', this.savedData);
  }

  clearStorage(): void {
    this.savedData = this.defaultData
    this.storage.clear().then( _ => {
      this.storage.set('savedData', this.savedData).then( _ => {
        this.alerts.okAlert("Storage cleared");
      })
    }).catch(err => {
      console.error(err)
      this.alerts.okAlert("Failed to clear storage");
    })
  }

}



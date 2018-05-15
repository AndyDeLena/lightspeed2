import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { UtilitiesProvider } from '../utilities/utilities';
import { AlertsProvider } from '../alerts/alerts';

@Injectable()
export class WorkoutProvider {

  repTypes: Array<string> = [];

  repTemplates: any = {};

  repsList: Array<any> = [];

  constructor(public storage: Storage, public alertCtrl: AlertController, public util: UtilitiesProvider, public alerts: AlertsProvider) {
    this.initializeRepTemplates();
  }

  initializeRepTemplates(): void {
    this.repTemplates = {
      "5-10-5": {
        startAt: "5 yards",
        segments: [
          {
            id: 1,
            direction: "forward",
            distance: "5 yards",
            color: "red",
            speed: "",
            speedUnit: "mph"
          },
          {
            id: 2,
            direction: "backward",
            distance: "10 yards",
            color: "red",
            speed: "",
            speedUnit: "mph"
          },
          {
            id: 3,
            direction: "forward",
            distance: "5 sec",
            color: "red",
            speed: "",
            speedUnit: "mph"
          }]
      }
    }

    this.repTypeKeys();
  }

  addRepTemplate(name, startAt, segments): void {
    this.repTemplates[name] = {
      startAt: startAt,
      segments: segments
    }
    this.repTypeKeys();
  }

  repTypeKeys(): void {
    this.repTypes = Object.keys(this.repTemplates);
    this.repTypes.push("Create New Type...");
  }


  addToWorkout(name): void {

  }
}

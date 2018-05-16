import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { UtilitiesProvider } from '../utilities/utilities';
import { AlertsProvider } from '../alerts/alerts';

@Injectable()
export class WorkoutProvider {

  //CONFIG VARAIBLES

  //REPS LIST
  repsList: Array<any> = [];

  constructor(public util: UtilitiesProvider, public alerts: AlertsProvider) {
  
  }

}

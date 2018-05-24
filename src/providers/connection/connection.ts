import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { BLE } from '@ionic-native/ble';
import { Platform, ModalController } from 'ionic-angular';
import { AlertsProvider } from '../alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { WorkoutProvider } from '../../providers/workout/workout';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';

@Injectable()
export class ConnectionProvider {

  zone: any;

  availableBoxes: Array<{ name: string, id: string, connected: boolean }> = [];
  activeBoxes: Array<{ name: string, id: string }> = [];

  subRetries: number = 0;

  uuids = {
    service: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    rx: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    tx: "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
  }

  currentRx: Observable<any>;
  rxObserver: any;

  constructor(public ble: BLE, public modalCtrl: ModalController, public platform: Platform, public alerts: AlertsProvider, public util: UtilitiesProvider, public workout: WorkoutProvider) {

    this.zone = new NgZone({ enableLongStackTrace: false });

    this.currentRx = Observable.create(observer => {
      this.rxObserver = observer;
    });

  }

  //**********************************************************************************//
  //******************************** CONNECTION MGMT *********************************//
  //**********************************************************************************//

  setActive(name, id): void {
    this.activeBoxes.push({ name: name, id: id });
    for (let b of this.availableBoxes) {
      if (b.id == id) {
        b.connected = true;
      }
    }
  }

  clearActive(id): void {
    for (let b of this.activeBoxes) {
      if (b.id == id) {
        this.activeBoxes.splice(this.activeBoxes.indexOf(b), 1);
      }
    }
    for (let a of this.availableBoxes) {
      if (a.id == id) {
        a.connected = false;
      }
    }
  }

  scan(): Observable<any> {
    return Observable.create(observer => {
      //Note in Android SDK >= 23, Location Services must be enabled. If it has not been enabled,
      //the scan method will return no results even when BLE devices are in proximity.
      this.ble.startScan([]).subscribe(device => {
        if (device.name != undefined || device.advertising.kCBAdvDataLocalName != undefined) {
          //only find LightSpeed devices, ignore others
          if (device.name.includes('LightSpeed')) {
            observer.next(device);
          } else if (device.advertising.kCBAdvDataLocalName.includes('LightSpeed')) {
            device.name = device.advertising.kCBAdvDataLocalName;
            observer.next(device);
          }
        } else {
          console.log("device.name is undefined");
        }
      });
      //scan for 5 seconds, then notify subscriber that observable is complete
      setTimeout(() => {
        this.ble.stopScan().then(observer.complete());
        console.log('scan finished');
      }, 5000);
    });

  }

  connect(name, id): void {
    this.ble.connect(id).subscribe(data => {
      //call setActive so that write operation will be allowed, but clear it in error handlers
      //until we're sure that the whole phone > arduino > feather > arduino > phone chain is copacetic 
      this.zone.run(() => {
        this.alerts.okAlert('Connected Sucessfully');
        this.setActive(name, id);
      });
      //make sure we're using correct set of UUIDS (damnit intel)
      this.subscribeRx(name, id);
    }, err => {
      this.zone.run(() => { this.clearActive(id) });
      console.log('BLE connection error: ', err);
      this.alerts.okAlert('Bluetooth Error', 'Connection to LightSpeed has been severed. Please re-connect to continue using the system.');
    });
  }

  subscribeRx(name, id): void {
    this.ble.startNotification(id, this.uuids.service, this.uuids.rx).subscribe(d => {
      let data = this.util.ab2str(d);
      if (data.endsWith('AT+BLEUARTRX')) {  //this was happening sometimes. I forget exactly why. Maybe had to do with erroneously using .readString() w/ software serial. but whatever
        data = data.substring(0, data.length - 12);
      }
      data = data.trim();
      this.rxObserver.next(data);
      console.log('RX:', data);
    }, err => {
      if (!this.subRetries) {
        if (typeof (err) == 'string') {
          if (err.includes("Could not find service") || err.includes("Attempt to invoke virtual")) {
            this.subRetries++;
            this.subscribeRx(name, id);
          } else if (err == 'timed out') {
            this.alerts.okAlert('Hardware Error', 'Please contact DomTech for support: domtechllc@gmail.com. We\'re very sorry for the inconvenience.');
            this.ble.disconnect(id);
            this.zone.run(() => { this.clearActive(id) });
          } else {
            this.unknownErrorHandler(err);
          }
        } else {
          this.unknownErrorHandler(err);
        }
      } else {
        this.subRetries = 0;
        this.servicesError(id, err);
      }
    });
  }

  servicesError(id, err): void {
    //already tried both sets of UUIDs, nothing worked. Something else is wrong
    this.zone.run(() => { this.clearActive(id) });
    this.alerts.okAlert('Bluetooth Error', 'Could not establish services.');
    this.ble.disconnect(id);
    console.log(err);
  }

  unknownErrorHandler(id, err?): void {
    this.zone.run(() => { this.clearActive(id) });
    this.alerts.okAlert('Bluetooth Error', 'An unknown error occurred.');
    this.ble.disconnect(id);
    if (err) {
      console.log(err);
    }
  }

  disconnect(id): Promise<any> {
    this.clearActive(id);
    return this.ble.disconnect(id);
  }


  //**********************************************************************************//
  //************************************* INCOMING ***********************************//
  //**********************************************************************************//
  incoming(): Observable<any> {
    return this.currentRx;
  }


  //**********************************************************************************//
  //************************************* OUTGOING ***********************************//
  //**********************************************************************************//
  write(data): Promise<any> {
    let promises = [];
    if (this.activeBoxes.length) {
      for (let b of this.activeBoxes) {
        promises.push(this.ble.write(b.id, this.uuids.service, this.uuids.tx, data));
      }
      return Promise.all(promises);
    } else {
      return Promise.resolve("OK");
    }
  }

  play(bleCmds): Promise<any> {
    let promises: Array<any> = [];
    for (let c of bleCmds) {
      promises.push(this.write(c));
    }
    return Promise.all(promises);
  }

  stop(rep): void {
    let data: Array<number> = [1, this.workout.repsList.indexOf(rep)];
    let data16 = new Uint16Array(data);
    this.write(data16);
  }

  stopPattern(): void {
    let data = [1, 0];
    let data16 = new Uint16Array(data);
    this.write(data16);
  }

}

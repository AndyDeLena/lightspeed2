import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/observable';
import { BLE } from '@ionic-native/ble';
import { Platform, ModalController } from 'ionic-angular';
import { AlertsProvider } from '../alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { WorkoutProvider } from '../../providers/workout/workout';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';

@Injectable()
export class ConnectionProvider {

  zone: any;

  active: boolean = false;
  activeName: string = '';
  activeId: string = '';

  hardware: string = 'intel';
  subRetries: number = 0;

  uuids = {
    uno: {
      service: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
      rx: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
      tx: "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
    },
    intel: {
      service: '3f410000-8d1f-485c-86aa-b52bd644cff1',
      rx: '3f410002-8d1f-485c-86aa-b52bd644cff1',
      tx: '3f410001-8d1f-485c-86aa-b52bd644cff1'
    }
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
    this.active = true;
    this.activeId = id;
    this.activeName = name;
  }

  clearActive(): void {
    this.active = false;
    this.activeId = '';
    this.activeName = '';
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
        this.setActive(name, id)
      });
      //make sure we're using correct set of UUIDS (damnit intel)
      this.subscribeRx(name, id);
    }, err => {
      this.zone.run(() => { this.clearActive() });
      console.log('BLE connection error: ', err);
      this.alerts.okAlert('Bluetooth Error', 'Connection to LightSpeed has been severed. Please re-connect to continue using the system.');
    });
  }

  subscribeRx(name, id): void {
    this.ble.startNotification(this.activeId, this.uuids[this.hardware].service, this.uuids[this.hardware].rx).subscribe(d => {
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
            if (this.hardware == 'uno') {
              //try other set of UUIDS
              this.hardware = 'intel';
            } else {
              this.hardware = 'uno';
            }
            this.subRetries++;
            this.subscribeRx(name, id);
          } else if (err == 'timed out') {
            this.alerts.okAlert('Hardware Error', 'Please contact DomTech for support: domtechllc@gmail.com. We\'re very sorry for the inconvenience.');
            this.ble.disconnect(id);
            this.zone.run(() => { this.clearActive() });
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
    this.zone.run(() => { this.clearActive() });
    this.alerts.okAlert('Bluetooth Error', 'Could not establish services.');
    this.ble.disconnect(id);
    console.log(err);
  }

  unknownErrorHandler(id, err?): void {
    this.zone.run(() => { this.clearActive() });
    this.alerts.okAlert('Bluetooth Error', 'An unknown error occurred.');
    this.ble.disconnect(id);
    if (err) {
      console.log(err);
    }
  }

  disconnect(): Promise<any> {
    return this.ble.disconnect(this.activeId);
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
  writeNoRx(data): Promise<any> {
    if (this.active) {
      return this.ble.write(this.activeId, this.uuids[this.hardware].service, this.uuids[this.hardware].tx, data);
    } else {
      return Promise.resolve("OK");
    }
  }


  write(data): Promise<any> {
    if (this.active) {
      return new Promise((resolve, reject) => {
        if (this.active) {
          this.ble.write(this.activeId, this.uuids[this.hardware].service, this.uuids[this.hardware].tx, this.util.str2ab(data))
            .then(res => {
              clearTimeout(writeTimeout);
              this.currentRx.subscribe(rx => {
                clearTimeout(rxTimeout);
                resolve(rx);
              });

              let rxTimeout = setTimeout(() => {
                reject('timed out');
              }, 3000);

            })
            .catch(err => {
              clearTimeout(writeTimeout);
              reject(err);
            });

          let writeTimeout = setTimeout(() => {
            reject('write timed out');
          }, 3000);
        } else {
          reject('not connected');
        }
      });
    } else {
      return Promise.resolve('OK');
    }
  }

  enableRFM(): void {
    this.writeNoRx("CA1").then(() => {
      this.writeNoRx("CA2").then(() => {
        this.writeNoRx("CA3").then(() => {
          this.writeNoRx("CA4").then(() => {
            this.writeNoRx("CA5").then(() => {
            });
          });
        });
      });
    }).catch(err => {
      console.log("enableRFM error: ", err);
    });

  }

  play(bleStrings): Promise<any> {
    return new Promise((resolve, reject) => {
      let i = 0;

      let internalCallback = () => {
        this.writeNoRx(this.util.str2ab(bleStrings[i])).then(res => {
          if (res == 'OK' || res == null) {
            //success. send next string or finish
            i++;
            if (i >= bleStrings.length) {
              resolve('OK');
            } else {
              internalCallback();
            }
          } else {
            reject(res);
          }
        }).catch(err => {
          reject(err);
        });
      }
      internalCallback();
    });
  }

  pickALight(color, node): Promise<any> {
    let colorStr = this.util.formatColor(color);
    let nodeStr = this.util.lengthify(node, 3);

    //play, forward (could really be either), start on tone (immediately), specified color and node, keep lit for 99999ms, and don't repeat
    let bleStr = "AFT" + nodeStr + colorStr + "9999900001";

    return this.writeNoRx(this.util.str2ab(bleStr));
  }

  stop(): Promise<any> {
    let data = 'B';
    return this.writeNoRx(this.util.str2ab(data));
  }

}

import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { BLE } from '@ionic-native/ble';
import { Platform, ModalController } from 'ionic-angular';
import { AlertsProvider } from '../alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { DataProvider } from '../../providers/data/data';

@Injectable()
export class ConnectionProvider {

  zone: any;

  availableBoxes: Array<{ name: string, id: string, connected: boolean }> = [];
  activeBoxes: Array<{ name: string, id: string }> = [];

  uuids = {
    service: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
    write: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
    read: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
  }


  constructor(public ble: BLE, public modalCtrl: ModalController, public dataService: DataProvider, public platform: Platform, public alerts: AlertsProvider, public util: UtilitiesProvider) {

    this.zone = new NgZone({ enableLongStackTrace: false });

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
        console.log(device)
        if (device.name) {
          //only find LightSpeed devices, ignore others
          if (device.name.includes('LightSpeed')) {
            observer.next(device);
          }
        }
      })
      //scan for 5 seconds, then notify subscriber that observable is complete
      setTimeout(() => {
        this.ble.stopScan().then(observer.complete());
        console.log('scan finished');
      }, 5000);
    });

  }

  connect(name, id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ble.connect(id).subscribe(data => {
        //call setActive so that write operation will be allowed, but clear it in error handlers
        //until we're sure that the whole phone > arduino > feather > arduino > phone chain is copacetic 
        this.zone.run(() => {
          this.initializeLightStrips(id).then(_ => {
            this.alerts.okAlert('Connected Sucessfully');
            this.setActive(name, id);
            resolve("OK");
          }).catch(err => {
            this.alerts.okAlert("Error", "Could not initialize light strips. Please try again.");
            this.disconnect(id);
            reject(err);
          })
        });
      }, err => {
        this.zone.run(() => { this.clearActive(id) });
        console.log('BLE connection error: ', err);
        this.alerts.okAlert('Bluetooth Error', 'Connection to LightSpeed has been severed. Please re-connect to continue using the system.');
      });
    })
  }

  initializeLightStrips(id): Promise<any> {
    let buf = new ArrayBuffer(4);
    let cmd = new Uint16Array(buf);

    let totalNodes = this.util.stringToNum(this.dataService.savedData.maxSystemLength) * +this.dataService.savedData.nodesPerYard;

    cmd[0] = 4;
    cmd[1] = totalNodes;

    return this.ble.write(id, this.uuids.service, this.uuids.write, buf)
  }


  disconnectAll(): void {
    for (let b of this.activeBoxes) {
      this.disconnect(b.id)
    }
  }

  disconnect(id): Promise<any> {
    this.clearActive(id);
    return this.ble.disconnect(id);
  }


  //**********************************************************************************//
  //************************************* INCOMING ***********************************//
  //**********************************************************************************//
  readTrigger(): Promise<any> {
    return this.ble.read(this.activeBoxes[0].id, this.uuids.service, this.uuids.read)
  }

  //**********************************************************************************//
  //************************************* OUTGOING ***********************************//
  //**********************************************************************************//
  write(data): Promise<any> {
    return new Promise((resolve, reject) => {
      let promises = [];
      if (this.activeBoxes.length) {
        for (let b of this.activeBoxes) {
          promises.push(this.ble.write(b.id, this.uuids.service, this.uuids.write, data));
        }
        Promise.all(promises).then(_ => {
          resolve("OK")
        }).catch(err => {
          reject(err)
        })
      } else {
        return Promise.resolve("OK");
      }
    })
  }

  play(bleCmds): Promise<any> {
    return new Promise((resolve, reject ) => {
      let promises: Array<any> = [];
      for (let c of bleCmds) {
        promises.push(this.write(c));
      }
      return Promise.all(promises).then(_ => {
        resolve("OK")
      }).catch(err => {
        reject(err)
      })
    })
  }

  stop(rep): void {
    let buf = new ArrayBuffer(4);
    let cmd = new Uint16Array(buf);

    cmd[0] = 1;
    cmd[1] = this.dataService.repsList.indexOf(rep);

    this.write(buf);
  }

  stopDynamic(): void {
    let buf = new ArrayBuffer(4);
    let cmd = new Uint16Array(buf);

    cmd[0] = 1;
    cmd[1] = 0;

    this.write(buf);
  }

  stopPattern(): void {
    let buf = new ArrayBuffer(2);
    let cmd = new Uint16Array(buf);

    cmd[0] = 3;

    this.write(buf);
  }

}

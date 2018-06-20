import { Component } from '@angular/core'
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular'
import { ConnectionProvider } from '../../providers/connection/connection'
import { DataProvider } from '../../providers/data/data'
import { UtilitiesProvider } from '../../providers/utilities/utilities'

@IonicPage()
@Component({
  selector: 'page-remote-control',
  templateUrl: 'remote-control.html',
})
export class RemoteControlPage {

  staticOrDynamic: string = "static"
  availableColors: Array<string> = ['green', 'blue', 'red']
  selectedColor: string = "green"
  lights: Array<{ id: number, active: boolean, color: string }> = []
  forwardSpeed: number = null;
  backwardSpeed: number = null;
  startAt: string = "Beginning"
  forwardSpeedUnit: string = "mph";
  backwardSpeedUnit: string = "mph";

  constructor(public navCtrl: NavController, public util: UtilitiesProvider, public dataService: DataProvider, public connection: ConnectionProvider, public modalCtrl: ModalController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.fillLights();
    this.dataService.updateSystemLength(this.dataService.savedData.systemLength);
  }

  updateSystemLength(newLength): void {
    this.dataService.updateSystemLength(newLength);
    this.fillLights();
  }

  fillLights(): void {
    this.lights = [];
    let buttons = (this.util.stringToNum(this.dataService.savedData.systemLength) * this.dataService.savedData.nodesPerYard) / this.dataService.savedData.numSections; 
    for (let i = 1; i <= buttons; i++) {
      this.lights.push({ id: i, active: false, color: 'dark' });
    }
  }

  alight(light): void {
    for(let l of this.lights){
      l.active = false
      l.color = 'dark'
    }

    let len = this.util.stringToNum(this.dataService.savedData.systemLength) * this.dataService.savedData.nodesPerYard;
    let sec = this.dataService.savedData.numSections;
    let interval = Math.floor(len / sec) + 1;

    let cmd = this.util.buildStaticCommands(this.selectedColor, light.id - 1, interval, len);

    light.color = this.selectedColor
    light.active = true
  }

  unalight(light): void {
    for(let l of this.lights){
      l.active = false;
      l.color = 'dark';
    }
    this.connection.stopPattern();
  }

  forward(): void {

  }

  backward(): void {

  }

  pause(): void {

  }

  reset(): void {

  }

  noBlePopup(): void {
    let bleModal = this.modalCtrl.create("BluetoothPage");
    bleModal.present();
  }

}

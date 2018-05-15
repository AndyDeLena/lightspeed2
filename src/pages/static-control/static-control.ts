import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';

@IonicPage()
@Component({
  selector: 'page-static-control',
  templateUrl: 'static-control.html',
})
export class StaticControlPage {

  availableColors: Array<string> = ['red', 'green', 'blue'];
  selectedColor: string = "red";

  systemLength: string = "10 yards";
  numSections: number = 1;

  lights: Array<{ id: number, active: boolean, color: string }> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.fillLights();
  }

  fillLights(): void {
    this.lights = [];
    let buttons = (this.util.stringToNum(this.systemLength) * 2) / this.numSections;  //2 LEDs per yard
    for (let i = 1; i <= buttons; i++) {
      this.lights.push({ id: i, active: false, color: 'dark' });
    }
  }

  activateLight(light): void {
    for (let l of this.lights) {
      this.deactivateLight(l);
    }
    light.active = true;
    light.color = this.selectedColor;
  }

  deactivateLight(light): void {
    light.active = false;
    light.color = "dark";
  }

}

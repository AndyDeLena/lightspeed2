import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, AlertController } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { WorkoutProvider } from '../../providers/workout/workout';

@IonicPage()
@Component({
  selector: 'page-new-rep-type',
  templateUrl: 'new-rep-type.html',
})
export class NewRepTypePage {

  startAtOptions: Array<string> = [];
  distanceOptions: Array<string> = [];
  selectedColor: string = 'red';

  name: string = "";
  startAt: string = "";
  segments: Array<any> = [];

  constructor(public viewCtrl: ViewController, public workout: WorkoutProvider, public alertCtrl: AlertController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.initializeDistances();
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  initializeDistances(): void {
    this.startAtOptions.push("0 yard mark");

    for (let i = 2.5; i <= 100; i += 2.5) {
      this.startAtOptions.push(i + " yard mark");
      this.distanceOptions.push(i + " yards");
    }
  }

  selectSegColor(id, color): void {
    this.segments[id - 1].color = color;
  }

  outlineSegColor(id, color): string {
    if (this.segments[id - 1].color == color) {
      return '4px solid black';
    } else {
      return '';
    }
  }

  addSegment(): void {
    this.segments.push({ id: this.segments.length + 1, direction: "", distance: "", speed: "", speedUnit: "" });
  }

  removeSegment(id): void {
    this.segments.splice((id - 1), 1);
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].id = i + 1;
    }
  }

  saveRepType(): void {
    for (let seg of this.segments) {
      seg.speed = "";
      seg.speedUnit = "sec";
    }

    this.workout.addRepTemplate(this.name, this.startAt, this.segments);
    
    this.viewCtrl.dismiss();
  }

}

import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, AlertController } from 'ionic-angular';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { WorkoutProvider } from '../../providers/workout/workout';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { DataProvider } from '../../providers/data/data';


@IonicPage()
@Component({
  selector: 'page-new-rep-type',
  templateUrl: 'new-rep-type.html',
})
export class NewRepTypePage {

  pageTitle: string = "New Rep Type";
  buttonCaption: string = "Save Rep Type"

  editingName: string = "";

  startAtOptions: Array<string> = [];

  name: string = "";
  startAt: string = "";
  segments: Array<any> = [];

  constructor(public viewCtrl: ViewController, public alerts: AlertsProvider, public dataService: DataProvider, public workout: WorkoutProvider, public alertCtrl: AlertController, public navParams: NavParams, public util: UtilitiesProvider) {
    this.initializeDistances();

    let name = this.navParams.get('name');

    if (name) {
      this.pageTitle = "Edit Rep Type";
      this.buttonCaption = "Update Rep Type";

      this.editingName = name;

      this.name = name;
      this.startAt = this.dataService.savedData.savedRepTypes[name].segments[0].startAt;
      this.segments = this.dataService.savedData.savedRepTypes[name].segments;
    }
  }

  dismiss(): void {
    this.viewCtrl.dismiss({ newName: "" });
  }

  initializeDistances(): void {
    this.startAtOptions.push("0 yard mark");

    for (let i = 2.5; i <= 100; i += 2.5) {
      this.startAtOptions.push(i + " yard mark");
    }
  }

  selectSegColor(id, color): void {
    this.segments[id - 1].color = color;
  }

  segBorder(id, color): string {
    if (this.segments[id - 1].color == color) {
      return '4px solid black';
    } else {
      return '';
    }
  }

  addSegment(): void {
    this.segments.push({ id: this.segments.length + 1, direction: "", distance: "" });
  }

  removeSegment(id): void {
    this.segments.splice((id - 1), 1);
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].id = i + 1;
    }
  }

  saveRepType(): void {

    let valid = this.validateType();

    if (valid) {
      let saveObj = {
        segments: this.segments,
      }

      if (this.pageTitle == "Edit Rep Type") {
        this.dataService.removeObject('savedRepTypes', this.editingName);
        this.dataService.saveObject('savedRepTypes', this.name, saveObj);
        this.viewCtrl.dismiss({ newName: this.name });
      } else {
        let typeExists = this.dataService.checkExists('savedRepTypes', this.name);

        if (typeExists) {
          this.alerts.okAlert("Error", "This name is already taken. Please choose another.");
        } else {
          this.dataService.saveObject('savedRepTypes', this.name, saveObj);
          this.viewCtrl.dismiss({ newName: "" });
        }
      }
    }
  }

  validateType(): boolean {
    if (!this.name.length) {
      this.alerts.okAlert('Error', 'Please enter a name.');
      return false;
    } else if (!this.startAt.length) {
      this.alerts.okAlert('Error', 'Please select a starting position.');
      return false;
    } else if (!this.segments.length) {
      this.alerts.okAlert('Error', 'Please add at least one segment.');
      return false;
    }

    let yardMark = this.util.stringToNum(this.startAt);

    for (let s of this.segments) {
      let id = this.segments.indexOf(s) + 1;
      if (!s.color) {
        this.alerts.okAlert('Error', 'Please choose a color for Segment ' + id);
        return false;
      } else if (!s.direction) {
        this.alerts.okAlert('Error', 'Please choose a direction for Segment ' + id);
        return false;
      } else if (!s.distance) {
        this.alerts.okAlert('Error', 'Please choose a distance for Segment ' + id);
        return false;
      }

      s.startAt = yardMark + " yards";

      if (s.direction == 'Forward') {
        yardMark += this.util.stringToNum(s.distance);
      } else {
        yardMark -= this.util.stringToNum(s.distance);
      }

      if (yardMark < 0) {
        this.alerts.okAlert('Error', 'Segment ' + id + ' extends past the beginning of the system.');
        return false;
      }
    }

    return true;
  }

}

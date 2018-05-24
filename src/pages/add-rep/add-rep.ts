import { Component } from '@angular/core';
import { IonicPage, Platform, NavParams, ViewController, ActionSheetController, ModalController } from 'ionic-angular';
import { WorkoutProvider } from '../../providers/workout/workout';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-add-rep',
  templateUrl: 'add-rep.html',
})
export class AddRepPage {

  pageTitle: string = "Add a Rep";
  buttonCaption: string = "Add";

  editingId: number;

  selectedRepType: string = "";

  newRep: any = {
    avatarColor: "",
    individualSpeeds: false,
    overallSpeed: null,
    speedUnit: 'sec',
    caption: '',
    segments: []              //color, direction, startAt, distance, speed, speedUnit, msDelay
  };

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public alerts: AlertsProvider, public dataService: DataProvider, public workout: WorkoutProvider, public modalCtrl: ModalController, public util: UtilitiesProvider, public actionCtrl: ActionSheetController, public platform: Platform) {
    let editing = this.navParams.get('editing');

    if (editing) {
      this.pageTitle = "Edit Rep";
      this.buttonCaption = "Update";

      this.editingId = this.workout.repsList.indexOf(editing);

      this.selectedRepType = editing.type;

      this.newRep = editing.data;

    }
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  repTypeChange(type): void {
    if (type == "Create new type...") {
      this.createNewRepType();
    } else {
      //multi-seg rep
      this.blankRep(type);
    }
  }

  blankRep(type): void {
    if (type == "Linear sprint") {
      this.newRep.segments = [{color: "red", direction: "Forward", startAt: "0 yards", distance: null, speed: null, speedUnit: this.newRep.speedUnit, msDelay: null}];
    } else {
      let savedType = this.dataService.savedData.savedRepTypes[type];

      if (savedType) {
        this.newRep.segments = savedType.segments;

        //add fields that aren't stored with rep template
        for (let s of this.newRep.segments) {
          s.speed = null;
          s.speedUnit = this.newRep.overallSpeedUnit;
          s.msDelay = null;
        }
      }
    }
  }

  openRepActionSheet(): void {
    let as = this.actionCtrl.create({
      title: "Options",
      buttons: [
        {
          text: "Edit " + this.selectedRepType + " structure",
          icon: !this.platform.is('ios') ? 'build' : null,
          handler: () => { this.editRepType() }
        },
        {
          text: "Remove " + this.selectedRepType + " from rep types",
          role: "destructive",
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => { this.removeRepType() }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        }
      ]
    });
    as.present();
  }

  createNewRepType(): void {
    let modal = this.modalCtrl.create('NewRepTypePage');
    modal.onDidDismiss(data => {
      this.selectedRepType = data.newName;
    });
    modal.present();
  }

  editRepType(): void {
    let modal = this.modalCtrl.create("NewRepTypePage", { name: this.selectedRepType });
    modal.onDidDismiss(data => {
      this.selectedRepType = data.newName;
    });
    modal.present();
  }

  removeRepType(): void {
    let typeToDelete = this.selectedRepType;
    this.alerts.okCancelAlert('Delete', 'Are you sure you want to delete this rep type?', 'Yes').then(res => {
      if (res == "OK") {
        this.selectedRepType = "";
        this.dataService.removeObject('savedRepTypes', typeToDelete);
      }
    });
  }

  indvSpeedToggle(): void {
    this.newRep.overallSpeed = null;
    for (let s of this.newRep.segments) {
      s.speed = null;
    }
  }

  addToWorkout(): void {
    let valid = this.validateRep();

    if (!valid) {
      return
    } else {
      this.normalizeSpeed();

      this.setAvatarColor();

      if (this.selectedRepType == "Create new type...") {
        //nothing
      } else if (this.selectedRepType == "Linear sprint") {
        this.newRep.caption = this.newRep.segments[0].distance + ", " + this.newRep.overallSpeed + " " + this.newRep.speedUnit;
      } else {
        this.newRep.caption = this.selectedRepType + ", " + this.newRep.overallSpeed + " " + this.newRep.speedUnit;
      }

      if (this.pageTitle == "Edit Rep") {
        this.workout.repsList.splice(this.editingId, 1, { type: this.selectedRepType, data: this.newRep });
      } else {
        this.workout.repsList.push({ type: this.selectedRepType, data: this.newRep });
      }

      this.viewCtrl.dismiss();
    }

  }

  validateRep(): boolean {
    if (!this.selectedRepType.length || this.selectedRepType == "Create new type...") {
      this.alerts.okAlert('Error', 'Please choose a rep type.');
      return false;
    }

    if (this.selectedRepType == 'Linear sprint') {
      if (!this.newRep.segments[0].color.length) {
        this.alerts.okAlert('Error', 'Please select a color.');
        return false;
      } else if (!this.newRep.segments[0].distance.length) {
        this.alerts.okAlert('Error', 'Please select a distance.');
        return false;
      } else if (!this.newRep.overallSpeed) {
        this.alerts.okAlert('Error', 'Please enter a speed.');
        return false;
      }

      return true;

    } else {
      if (!this.newRep.overallSpeed) {
        let valid = true;
        for (let s of this.newRep.segments) {
          if (!s.speed) {
            valid = false;
            break;
          }
        }
        if (!valid) {
          this.alerts.okAlert('Error', 'Please enter a speed.');
        }
        return valid;

      } else {
        return true;
      }

    }
  }

  normalizeSpeed(): void {
    if (this.selectedRepType == "Linear sprint") {
      let sprintSeg = this.newRep.segments[0];
      sprintSeg.speed = this.newRep.overallSpeed;
      sprintSeg.speedUnit = this.newRep.speedUnit;
      sprintSeg.msDelay = this.util.speedToMsDelay(sprintSeg.speed, sprintSeg.speedUnit, sprintSeg.distance);
    } else {
      if (this.newRep.overallSpeed) {
        if (this.newRep.speedUnit == 'sec') {
          let totalDistance = 0;
          for (let s of this.newRep.segments) {
            totalDistance += this.util.stringToNum(s.distance);
          }
          for (let t of this.newRep.segments) {
            let segDist = this.util.stringToNum(t.distance);
            let segSecs = (segDist / totalDistance) * parseFloat(this.newRep.overallSpeed);
            t.msDelay = this.util.speedToMsDelay(segSecs, this.newRep.speedUnit, t.distance);
          }
        } else {
          for (let s of this.newRep.segments) {
            s.msDelay = this.util.speedToMsDelay(this.newRep.overallSpeed, this.newRep.speedUnit);
          }
        }
      } else {
        if (this.newRep.speedUnit == 'sec') {
          for (let t of this.newRep.segments) {
            this.newRep.overallSpeed += parseFloat(t.speed);
          }
        } else {
          this.newRep.overallSpeed = "various";
        }

        for (let s of this.newRep.segments) {
          s.msDelay = this.util.speedToMsDelay(s.speed, this.newRep.speedUnit, s.distance);
        }
      }
    }
  }

  setAvatarColor(): void {
    if (this.selectedRepType == "Linear sprint") {
      this.newRep.avatarColor = this.newRep.segments[0].color;
    } else {
      let rainbow = false;

      for (let i = 1; i < this.newRep.segments.length; i++) {
        if (this.newRep.segments[i].color != this.newRep.segments[i - 1].color) {
          rainbow = true;
          break;
        }
      }
      if (rainbow) {
        this.newRep.avatarColor = 'rainbow';
      } else {
        this.newRep.avatarColor = this.newRep.segments[0].color;
      }
    }

  }

}

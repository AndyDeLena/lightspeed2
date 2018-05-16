import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ViewController, ActionSheetController, AlertController, ModalController } from 'ionic-angular';
import { WorkoutProvider } from '../../providers/workout/workout';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { ConnectionProvider } from '../../providers/connection/connection';
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

  linearSprint: any = {
    color: "",
    distance: "",
    speed: null,
    speedUnit: "sec",
    msDelay: 0,
    caption: "",
  };

  multiSegRep: any = {
    color: "",
    individualSpeeds: false,
    startAt: '',
    overallSpeed: null,
    speedUnit: 'sec',
    caption: '',
    segments: []              //color, diretion, distance, speed, speedUnit
  };

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public alerts: AlertsProvider, public dataService: DataProvider, public workout: WorkoutProvider, public modalCtrl: ModalController, public util: UtilitiesProvider, public actionCtrl: ActionSheetController, public platform: Platform) {
    let editing = this.navParams.get('editing');

    if (editing) {
      this.pageTitle = "Edit Rep";
      this.buttonCaption = "Update";

      this.editingId = this.workout.repsList.indexOf(editing);

      this.selectedRepType = editing.type;

      if (editing.type == "Linear Sprint") {
        this.linearSprint = editing.data;
      } else {
        this.multiSegRep = editing.data;
        if(this.multiSegRep.overallSpeed == 'various'){
          this.multiSegRep.overallSpeed = null;
        }
      }
    }
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  repTypeChange(type): void {
    if (type == "Create New Type...") {
      this.createNewRepType();
    } else if (type == "Linear Sprint") {
      //nothing
    } else {
      //multi-seg rep
      this.blankMultiTypeRep(type);
    }
  }

  blankMultiTypeRep(type): void {
    let savedType = this.dataService.savedData.savedRepTypes[type];
    if (savedType) {
      this.multiSegRep.startAt = savedType.startAt;
      this.multiSegRep.segments = savedType.segments;

      //add fields that aren't stored with rep template
      for (let s of this.multiSegRep.segments) {
        s.speed = null
        s.speedUnit = this.multiSegRep.overallSpeedUnit;
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
    let alert = this.alerts.okCancelAlert('Delete', 'Are you sure you want to delete this rep type?', 'Yes').then(res => {
      if (res == "OK") {
        this.selectedRepType = "";
        this.dataService.removeObject('savedRepTypes', typeToDelete);
      }
    });
  }

  indvSpeedToggle(): void {
    this.multiSegRep.overallSpeed = null;
    for (let s of this.multiSegRep.segments) {
      s.speed = null;
    }
  }

  addToWorkout(): void {
    let valid = this.validateRep();

    if (!valid) {
      return
    } else {
      this.normalizeSpeed();

      if (this.selectedRepType == "Create New Type...") {
        //nothing
      } else if (this.selectedRepType == "Linear Sprint") {
        this.linearSprint.caption = this.linearSprint.distance + ", " + this.linearSprint.speed + " " + this.linearSprint.speedUnit;

        if (this.pageTitle == "Edit Rep") {
          this.workout.repsList.splice(this.editingId, 1, { type: this.selectedRepType, data: this.linearSprint });
        } else {
          this.workout.repsList.push({ type: this.selectedRepType, data: this.linearSprint });
        }
      } else {
        this.findMultiSegColor();

        this.multiSegRep.caption = this.selectedRepType + ", " + this.multiSegRep.overallSpeed + " " + this.multiSegRep.speedUnit;

        if (this.pageTitle == "Edit Rep") {
          this.workout.repsList.splice(this.editingId, 1, { type: this.selectedRepType, data: this.multiSegRep });
        } else {
          this.workout.repsList.push({ type: this.selectedRepType, data: this.multiSegRep });
        }
      }

      this.viewCtrl.dismiss();
    }
  }

  validateRep(): boolean {
    if (!this.selectedRepType.length || this.selectedRepType == "Create New Type...") {
      this.alerts.okAlert('Error', 'Please choose a rep type.');
      return false;
    }

    if (this.selectedRepType == 'Linear Sprint') {
      if (!this.linearSprint.color.length) {
        this.alerts.okAlert('Error', 'Please select a color.');
        return false;
      } else if (!this.linearSprint.distance.length) {
        this.alerts.okAlert('Error', 'Please select a distance.');
        return false;
      } else if (!this.linearSprint.speed) {
        this.alerts.okAlert('Error', 'Please enter a speed.');
        return false;
      }
    }

    return true;
  }

  normalizeSpeed(): void {
    if (this.selectedRepType == "Linear Sprint") {
      this.linearSprint.msDelay = this.util.speedToMsDelay(this.linearSprint.speed, this.linearSprint.speedUnit, this.linearSprint.distance);
    } else {
      if (this.multiSegRep.overallSpeed) {
        if (this.multiSegRep.speedUnit == 'sec') {
          let totalDistance = 0;
          for (let s of this.multiSegRep.segments) {
            totalDistance += this.util.stringToNum(s.distance);
          }
          for (let t of this.multiSegRep.segments) {
            let segDist = this.util.stringToNum(t.distance);
            let segSecs = (segDist / totalDistance) * this.multiSegRep.speed;
            t.msDelay = this.util.speedToMsDelay(segSecs, this.multiSegRep.speedUnit, t.distance);
          }
        } else {
          for (let s of this.multiSegRep.segments) {
            s.msDelay = this.util.speedToMsDelay(this.multiSegRep.speed, this.multiSegRep.speedUnit);
          }
        }
      } else {
        if (this.multiSegRep.speedUnit == 'sec') {
          for (let t of this.multiSegRep.segments) {
            this.multiSegRep.overallSpeed += parseFloat(t.speed);
          }
        } else {
          this.multiSegRep.overallSpeed = "various";
        }

        for (let s of this.multiSegRep.segments) {
          s.msDelay = this.util.speedToMsDelay(s.speed, this.multiSegRep.speedUnit, s.distance);
        }
      }
    }
  }

  findMultiSegColor(): void {
    let rainbow = false;
    for (let i = 1; i < this.multiSegRep.segments.length; i++) {
      if (this.multiSegRep.segments[i].color != this.multiSegRep.segments[i - 1].color) {
        rainbow = true;
        break;
      }
    }
    if (rainbow) {
      this.multiSegRep.color = 'rainbow';
    } else {
      this.multiSegRep.color = this.multiSegRep.segments[0].color;
    }
  }

}

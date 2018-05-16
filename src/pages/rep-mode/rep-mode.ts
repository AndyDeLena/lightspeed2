import { Component } from '@angular/core';
import { NavController, Platform, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { WorkoutProvider } from '../../providers/workout/workout';
import { DataProvider } from '../../providers/data/data';
import { AlertsProvider } from '../../providers/alerts/alerts';

@Component({
  selector: 'page-rep-mode',
  templateUrl: 'rep-mode.html',
})
export class RepModePage {

  constructor(public navCtrl: NavController, public alerts: AlertsProvider, public dataService: DataProvider, public alertCtrl: AlertController, public workout: WorkoutProvider, public platform: Platform, public modalCtrl: ModalController, public actionCtrl: ActionSheetController) {
  }

  openRepModal(): void {
    let modal = this.modalCtrl.create("AddRepPage");
    modal.present();
  }

  editRep(rep): void {
    let modal = this.modalCtrl.create("AddRepPage", { editing: rep });
    modal.present();
  }

  removeRep(rep): void {
    this.workout.repsList.splice(this.workout.repsList.indexOf(rep), 1);
  }

  startWorkout(): void {
    let valid = this.validateWorkout();

    if (valid) {
      this.navCtrl.push("RepDashboardPage");
    }
  }

  validateWorkout(): boolean {
    if (!this.workout.repsList.length) {
      this.alerts.okAlert('Error', 'Please add at least one rep to the workout in order to continue. Reps can be added with the green "+" button above.');
      return false;
    }

    return true;
  }

  openActionSheet(): void {
    let as = this.actionCtrl.create({
      title: "Options",
      buttons: [
        {
          text: "Save this workout",
          icon: !this.platform.is('ios') ? 'folder' : null,
          handler: (() => { this.saveWorkout() })
        },
        {
          text: "Load a saved workout",
          icon: !this.platform.is('ios') ? 'code-download' : null,
          handler: (() => { this.loadWorkout() })
        },
        {
          text: "Delete a saved workout",
          role: "destructive",
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: (() => { this.deleteSaved() })
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: !this.platform.is('ios') ? 'close' : null
        },
      ]
    });
    as.present();
  }

  saveWorkout(): void {
    let alert = this.alertCtrl.create({
      title: "Save Workout",
      subTitle: "What name would you like to save this workout under?",
      inputs: [
        {
          name: 'name',
          placeholder: 'Enter...'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            let exists = this.dataService.checkExists('savedWorkouts', data.name);
            if (!exists) {
              this.dataService.saveObject('savedWorkouts', data.name, this.workout.repsList);
            } else {
              let existAlert = this.alerts.okAlert('Error', 'A saved workout with this name already exists. Please enter another.');
            }
          }
        }
      ]
    });
    alert.present();
  }

  loadWorkout(): void {
    let self = this;
    let alert = this.alertCtrl.create();
    alert.setTitle('Load Workout');
    for (let name of this.dataService.savedData.contents.savedWorkouts) {
      alert.addInput({
        type: 'radio',
        label: name,
        value: name,
      });
    }
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Load',
      handler: data => {
        self.workout.repsList = JSON.parse(JSON.stringify(self.dataService.savedData.savedWorkouts[data]));
      }
    });
    alert.present();
  }

  deleteSaved(): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Delete Saved Workout');
    for (let name of this.dataService.savedData.contents.savedWorkouts) {
      alert.addInput({
        type: 'radio',
        label: name,
        value: name,
      });
    }
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Delete',
      role: 'destructive',
      handler: data => {
        this.dataService.removeObject('savedWorkouts', name);
      }
    });
    alert.present();
  }
}

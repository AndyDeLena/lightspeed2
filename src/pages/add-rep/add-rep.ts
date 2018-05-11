import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ViewController, ActionSheetController, AlertController, ModalController } from 'ionic-angular';
import { Segment } from '../../models/segment/segment';
import { WorkoutProvider } from '../../providers/workout/workout';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { ConnectionProvider } from '../../providers/connection/connection';

@IonicPage()
@Component({
  selector: 'page-add-rep',
  templateUrl: 'add-rep.html',
})
export class AddRepPage {

  indSegSpeeds = false;

  ///////////////////

  pageTitle: string = "Add a Rep";
  buttonCaption: string = "Add";

  selectedColor: string = "red";

  selectedRepType: string = "";

  distanceOptions: Array<string> = [];

  typeBuild: any = {segments: []};

  linearSprint: any = {distance: "", speed: "", speedUnit: "sec"};
  
  constructor(public viewCtrl: ViewController, public workout: WorkoutProvider, public modalCtrl: ModalController, public util: UtilitiesProvider, public actionCtrl: ActionSheetController, public platform: Platform){
    this.initializeDistances();
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  initializeDistances(): void {
    for(let i = 2.5; i <= 100; i += 2.5){
      this.distanceOptions.push(i + " yards");
    }
  }

  selectColor(color): void {
    this.selectedColor = color;
  }

  outline(color): string {
    if (this.selectedColor == color) {
      return '4px solid black';
    } else {
      return '';
    }
  }

  repTypeChange(type): void {
    if(type == "Create New Type..."){
      this.createNewRepType();
    }
  }

  openRepActionSheet(): void {
    let as = this.actionCtrl.create({
      title: "Rep Options",
      buttons: [
        {text: "Edit " + this.selectedRepType + " structure",
         icon: !this.platform.is('ios') ? 'build' : null,
         handler: ()=>{this.editRepType()}},
        {text: "Remove " + this.selectedRepType + " from rep types",
         role: "destructive",
         icon: !this.platform.is('ios') ? 'trash' : null,
         handler: ()=>{this.removeRepType()}},
        {text: 'Cancel',
         role: 'cancel',
         icon: !this.platform.is('ios') ? 'close' : null}
      ]
    });
    as.present();
  }

  createNewRepType(): void {
    let modal = this.modalCtrl.create('NewRepTypePage');
    modal.present();
  }

  editRepType(): void {

  }

  removeRepType(): void {

  }
}

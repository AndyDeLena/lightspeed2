import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

@Component({
  selector: 'page-rep-mode',
  templateUrl: 'rep-mode.html',
})
export class RepModePage {

  tempRepsList: Array<any> = [
    {
      avatarColor: 'red',
      description: '5-10-5',
      speed: "4.5 sec",
      playing: false
    },
    {
      avatarColor: 'rainbow',
      description: 'Beep Test',
      speed: "1 min 57 sec",
      playing: false
    },
    {
      avatarColor: 'rainbow',
      description: 'Out and Back',
      speed: "12.5 mph",
      playing: false
    }];

    playing: boolean = false;

  /////////////////////////////////

  configButton: string = "SHOW";
  configHidden: boolean = true;
  countdownLength: string = "None";
  randomHold: boolean = false;
  startOn: string = "End of countdown";
  playEachRep: string = "1 time";
  autoAdvReps: boolean = false;
  restTimeString: string = "";

  constructor(public navCtrl: NavController, public modalCtrl: ModalController) {
  }

  showHideConfig(): void {
    this.configHidden = !this.configHidden;
    if (this.configHidden) {
      this.configButton = "Show";
    } else {
      this.configButton = "Hide";
    }
  }

  openRepModal(): void {
    let modal = this.modalCtrl.create("AddRepPage");
    modal.present();
  }

  togglePlaying(rep): void {
    rep.playing = !rep.playing;
  }

}

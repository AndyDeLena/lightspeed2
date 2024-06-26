import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, ModalController, Navbar, NavController, NavParams } from 'ionic-angular';
import { ConnectionProvider } from '../../providers/connection/connection';
import { Media } from '@ionic-native/media';
import { UtilitiesProvider } from '../../providers/utilities/utilities';
import { AlertsProvider } from '../../providers/alerts/alerts';
import { Insomnia } from '@ionic-native/insomnia';
import { DataProvider } from '../../providers/data/data';

@IonicPage()
@Component({
  selector: 'page-rep-dashboard',
  templateUrl: 'rep-dashboard.html',
})
export class RepDashboardPage {
  @ViewChild(Navbar) navBar: Navbar;


  unregisterHwBackButton: any;

  sounds: Array<any> = [];

  configButton: string = "Hide";
  configHidden: boolean = false;

  countdownLength: string = "None";
  randomHold: boolean = false;
  startOn: string = "End of countdown";
  playEachRep: string = "1 time";
  autoAdvReps: boolean = false;
  shuffleReps: boolean = false;
  restMins: string = "0 min";
  restSecs: string = "0 sec";

  mins: Array<string> = [];
  secs: Array<string> = [];

  cancelTrigger: boolean = false;
 
  constructor(public navCtrl: NavController, public dataService: DataProvider, public platform: Platform, public insomnia: Insomnia, public alerts: AlertsProvider, public util: UtilitiesProvider, public media: Media, public connection: ConnectionProvider, public modalCtrl: ModalController, public navParams: NavParams) {

    for (let i = 0; i < 60; i++) {
      this.mins.push(i.toFixed(0) + " min");
      this.secs.push(i.toFixed(0) + " sec");
    }
  }

  ionViewDidLoad() {
    this.initializeSounds();

    if (this.platform.is('ios')) {
      this.iosBackButtonAction();
    } else {
      this.androidHwBackButtonAction();
    }

    this.insomnia.keepAwake();

    this.addRepFields();
  }

  addRepFields(): void {
    for (let r of this.dataService.repsList) {
      r.playing = false;
      r.display = "00:00.0";
      r.go = false;
      r.lightsActive = false;
      r.timesPlayed = 0;
      r.displayInt = null;
      r.holdTime = null;
      r.triggerInt = null;
    }
  }

  showHideConfig(): void {
    if (this.configButton == "Hide") {
      this.configButton = "Show";
      this.configHidden = true;
    } else {
      this.configButton = "Hide";
      this.configHidden = false;
    }
  }

  ionViewWillLeave() {
    this.insomnia.allowSleepAgain();

    // Unregister the custom back button action for this page
    this.unregisterHwBackButton && this.unregisterHwBackButton();
  }

  iosBackButtonAction(): void {
    //custom back button logic for this page b/c user might want to save splits
    this.navBar.backButtonClick = () => {
      this.done();
    }
  }

  androidHwBackButtonAction(): void {
    this.unregisterHwBackButton = this.platform.registerBackButtonAction(() => {
      this.done();
    });
  }

  initializeSounds(): void {
    for (let i = 1; i <= 10; i++) {
      this.sounds[i] = this.media.create('assets/sounds/countdown/' + i + '.mp3');
    }
    this.sounds['start'] = this.media.create('assets/sounds/start.mp3');
  }

  editRep(rep): void {
    let modal = this.modalCtrl.create("AddRepPage", { editing: rep });
    modal.onDidDismiss(() => {
      this.addRepFields();
    });
    modal.present();
  }

  updateDisplayTime(rep: any, disp: any, countdown?: string): void {
    let min, sec, minStr, secStr;

    if (disp == 'SET...') {
      rep.display = 'SET...';
    } else {
      min = Math.floor(disp / 60000);
      sec = ((disp % 60000) / 1000).toFixed(1);
      minStr = (min < 10 ? '0' : '') + min;
      secStr = (sec < 10 ? '0' : '') + sec;

      if (countdown) {
        rep.display = '-' + minStr + ':' + secStr;
      } else {
        rep.display = minStr + ':' + secStr;
      }
    }
  }

  play(rep): void {
    rep.playing = true;

    this.countdown(rep);
  }

  countdown(rep): void {
    let mSecs;
    if (this.countdownLength == 'None') {
      mSecs = 50; //since no "0" audio file, this will skip that if statement
    } else {
      mSecs = this.util.stringToNum(this.countdownLength) * 1000;
    }

    rep.displayInt = setInterval(() => {

      //update clock in LED controls
      this.updateDisplayTime(rep, mSecs, 'countdown');

      //play audio file if on a full second
      if (mSecs % 1000 == 0) {
        let num = (mSecs / 1000).toFixed(0);
        this.sounds[num].play();
      }

      mSecs -= 50;

      if (mSecs <= 0) {
        //countdown is over. Hold if necessary
        clearInterval(rep.displayInt);
        rep.display = '00:00.0';
        this.hold(rep);
      }
    }, 50);
  }

  hold(rep): void {
    if (this.randomHold) {
      this.updateDisplayTime(rep, 'SET...');
      //random number between 1 and 5
      let rand = Math.round(Math.random() * (1 - 4) + 4) * 1000;
      rep.holdTime = setTimeout(() => {
        rep.display = '00:00.0';
        this.startController(rep);
      }, rand);
    } else {
      this.startController(rep);
    }
  }

  startController(rep): void {
    //create strings
    let bleCmds = [];
    let sOn = this.startOn;

    for (let seg of rep.data.segments) {
      bleCmds.push(this.util.buildRepCommands(rep, seg, sOn));
      sOn = 'End of countdown';                         //don't wait for sensors on any segment other than the first
    }

    //ready to play the light show, so play the starting beep sound
    this.sounds['start'].play();

    //send segment strings to controller. stop light show (started above) if any errors occur
    this.connection.play(bleCmds);

    console.log("REP STARTED SUCCESSFULLY");
    this.trigger(rep);
  }

  trigger(rep): void {
    //don't bother to check if rep playing to trigger this.go -- just reset it here every time.
    rep.go = false;

    if (this.startOn == 'External trigger') {
      let _cb = () => {
        this.connection.readTrigger().then(res => {
          if (res == "1") {
            this.lightShow(rep, 0, 0);
          } else {
            if (this.cancelTrigger) {
              return;
            } else {
              _cb();
            }
          }
        }).catch(err => {
          console.error(err);
          return;
        });
      }
      _cb();
    } else {
      this.lightShow(rep, 0, 0);
    }
  }

  lightShow(rep, id, prevTime): void {
    let seg = rep.data.segments[id];

    let segMs = seg.msDelay * (this.util.stringToNum(seg.distance) * this.dataService.savedData.nodesPerYard);
    let clockMs = prevTime;
    let endOfSeg = clockMs + segMs;

    rep.lightsActive = true;

    //***** DISPLAY TIME INTERVAL *****//
    rep.displayInt = setInterval(() => {
      //update clock in LED controls
      this.updateDisplayTime(rep, clockMs);
      clockMs += 50;

      if (clockMs >= endOfSeg) {
        //segment is over
        clearInterval(rep.displayInt);
        //play next segment if there is one
        id++;
        if (rep.data.segments[id]) {
          this.lightShow(rep, id, endOfSeg);
        } else {
          this.restTime(rep);
          //rep time offically goes from lighting of first node to lighting of last, but keep last node lit for delayMs so it doesn't just blink on and then off right away
          /*let endWait = this.util.speedToMsDelay(seg.speed, seg.unit, seg.distance);
          rep.endingTime = setTimeout(() => {
            this.restTime(rep);
          }, endWait); */
        }
      }
    }, 50);
  }

  restTime(rep): void {
    rep.lightsActive = false;

    if (this.restMins != "0 mins" || this.restSecs != "0 secs") {
      let min = this.util.stringToNum(this.restMins);
      let sec = this.util.stringToNum(this.restSecs);

      let mSec = (min * 60000) + (sec * 1000);

      rep.displayInt = setInterval(() => {
        this.updateDisplayTime(rep, mSec, 'countdown');
        mSec -= 50;
        if (mSec <= 0) {
          //rest time is over. Move to next rep or end just end this one
          clearInterval(rep.displayInt);
          this.nextRep(rep);
        }
      }, 50);
    } else {
      this.nextRep(rep);
    }
  }

  nextRep(rep): void {
    rep.playing = false;
    rep.display = "00:00.0";
    rep.go = false;

    rep.timesPlayed++;

    if (rep.timesPlayed < this.util.stringToNum(this.playEachRep)) {
      this.play(rep);
    } else {
      rep.timesPlayed = 0;
      let newRep;
      let id;

      if (this.autoAdvReps || this.shuffleReps) {
        if (this.shuffleReps) {
          let l = this.dataService.repsList.length;
          id = Math.floor(Math.random() * (0 - l) + l);
        } else {
          id = this.dataService.repsList.indexOf(rep);
          id++;
          if (id >= this.dataService.repsList.length) {
            id = 0;
          }
        }

        newRep = this.dataService.repsList[id];
        this.play(newRep);
      }
    }
  }

  stop(rep): void {
    if(rep.lightsActive){
      this.connection.stop(rep);
    }

    rep.playing = false;
    rep.lightsActive = false;
    rep.display = "00:00.0";
    rep.go = false;
    rep.timesPlayed = 0;

    clearInterval(rep.displayInt);
    clearInterval(rep.triggerInt);
    clearTimeout(rep.holdTime);
  }

  done(): void {
    for (let rep of this.dataService.repsList) {
      if (rep.playing) {
        this.stop(rep);
      }
    }
    this.navCtrl.pop();
  }

  noBlePopup(): void {
    let bleModal = this.modalCtrl.create("BluetoothPage");
    bleModal.present();
  }





}

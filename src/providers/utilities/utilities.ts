import { Injectable } from '@angular/core';
import { WorkoutProvider } from '../workout/workout';

@Injectable()
export class UtilitiesProvider {

  colorBytes: any = { red: 0, green: 1, blue: 2 };
  directionBytes: any = { Forward: 0, Backward: 1 };
  triggerBytes: any = { "End of countdown": 0, "External trigger": 1 };


  constructor(public workout: WorkoutProvider) {

  }


  stringToNum(str): number {
    return parseFloat(str.substring(0, str.indexOf(" ")));
  }

  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  arrayToBuffer(array): ArrayBuffer {
    let buf = new ArrayBuffer(array);
    return buf;
  }

  lengthify(value, length) {
    var valStr = String(value);

    if (valStr.length < length) {
      for (var i = valStr.length; i < length; i++) {
        valStr = '0' + valStr;
      }
    } else {
      valStr = valStr.slice(0, length);
    }
    return valStr;
  }

  speedToMsDelay(speed, unit, distance?): number {
    //basically need to translate every UOM into ms/0.5yd
    switch (unit) {
      case 'mph':
        return 500 / (speed * 0.48889);             //500 because 1000ms per second and 0.5 yd light spacing
      case 'yd/sec':
        return 500 / speed;
      case 'ft/sec':
        return 500 / (speed / 3);
      case 'm/sec':
        return 500 / (speed * 1.0936);              //1.0936 yards / meter
      case 'km/h':
        return 500 / (speed * 0.3038);              //1 km/h = 0.3038 yd/s
      case 'sec':
        return (speed * 1000) / ((this.stringToNum(distance) * 2));
      default:
        return -1;
    }
  }

  buildRepCommands(r, s, sOn): ArrayBuffer {
    let buf = new ArrayBuffer(18);
    let cmd = new Uint16Array(buf);

    let i = 0;

    cmd[i] = (0); i++;                                 //command (play)
    cmd[i] = (this.workout.repsList.indexOf(r)); i++;   //repId
    cmd[i] = (r.data.segments.indexOf(s)); i++;       //segId
    cmd[i] = (this.directionBytes[s.direction]); i++;   //direction
    cmd[i] = (this.stringToNum(s.startAt) * 2); i++;       //startAt
    cmd[i] = (this.stringToNum(s.distance) * 2); i++;  //distance   //color
    cmd[i] = this.colorBytes[s.color]; i++;
    cmd[i] = (Math.round(s.msDelay)); i++;                         //speed
    cmd[i] = (this.triggerBytes[sOn]); i++;        //trigger

    return buf;
  }

  buildStaticCommands(color, node, interval): ArrayBuffer {
    let buf = new ArrayBuffer(8);
    let cmd = new Uint16Array(buf);

    let i = 0;

    cmd[i] = 2; i++;
    cmd[i] = this.colorBytes[color]; i++;
    cmd[i] = node; i++;
    cmd[i] = interval; i++;

    return buf;
  }

  buildDynamicCommands(color, interval, direction, speed, maxNode, chgDelay): ArrayBuffer {
    let buf = new ArrayBuffer(16);
    let cmd = new Uint16Array(buf);

    let i = 0;

    cmd[i] = (3); i++;
    cmd[i] = this.colorBytes[color]; i++;
    cmd[i] = (0); i++;
    cmd[i] = (interval); i++;
    cmd[i] = (this.directionBytes[direction]); i++;
    cmd[i] = (speed); i++;
    cmd[i] = (maxNode); i++;
    cmd[i] = (chgDelay); i++;

    return buf;
  }

  buildRecordedDynamic(record, interval, chg): Array<ArrayBuffer> {
    let cmds = [];

    for (let rec of record) {
      let buf = new ArrayBuffer(18);
      let cmd = new Uint16Array(buf);

      let i = 0;

      cmd[i] = (0); i++;
      cmd[i] = (0); i++;
      cmd[i] = (record.indexOf(rec)); i++;
      cmd[i] = (this.directionBytes[rec.direction]); i++;
      cmd[i] = (rec.startAt); i++;
      cmd[i] = (rec.distance); i++;
      cmd[i] = (this.colorBytes[rec.color]); i++;
      cmd[i] = (Math.round(rec.msDelay)); i++;
      cmd[i] = (0); i++;

      cmds.push(buf);
    }

    return cmds;

  }



}

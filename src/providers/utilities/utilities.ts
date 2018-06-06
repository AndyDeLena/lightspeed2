import { Injectable } from '@angular/core';
import { DataProvider } from '../data/data';

@Injectable()
export class UtilitiesProvider {

  colorBytes: any = { green: 0, blue: 1, red: 2 };
  directionBytes: any = { Forward: 0, Backward: 1 };
  triggerBytes: any = { "End of countdown": 0, "External trigger": 1 };


  constructor(public dataService: DataProvider) {
  
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
    let numerator = Math.round(1000 / this.dataService.savedData.nodesPerYard);

    switch (unit) {
      case 'mph':
        return numerator / (speed * 0.48889);
      case 'yd/sec':
        return numerator / speed;
      case 'ft/sec':
        return numerator / (speed / 3);
      case 'm/sec':
        return numerator / (speed * 1.0936);              //1.0936 yards / meter
      case 'km/h':
        return numerator / (speed * 0.3038);              //1 km/h = 0.3038 yd/s
      case 'sec':
        return (speed * 1000) / ((this.stringToNum(distance) * this.dataService.savedData.nodesPerYard));
      default:
        return -1;
    }
  }

  buildRepCommands(r, s, sOn): ArrayBuffer {
    let buf = new ArrayBuffer(18);
    let cmd = new Uint16Array(buf);

    cmd[0] = 0;                                        //command (play)
    cmd[1] = (this.dataService.repsList.indexOf(r));         //repId
    cmd[2] = (r.data.segments.indexOf(s));             //segId
    cmd[3] = (this.directionBytes[s.direction]);         //direction
    cmd[4] = (this.stringToNum(s.startAt) * this.dataService.savedData.nodesPerYard);   //startAt
    cmd[5] = (this.stringToNum(s.distance) * this.dataService.savedData.nodesPerYard);  //distance
    cmd[6] = this.colorBytes[s.color];                   //color
    cmd[7] = s.totalMs;                                 //total time
    cmd[8] = (this.triggerBytes[sOn]);                   //trigger

    return buf;
  }

  buildStaticCommands(color, node, interval, maxNode): ArrayBuffer {
    let buf = new ArrayBuffer(10);
    let cmd = new Uint16Array(buf);

    cmd[0] = 2; 
    cmd[1] = this.colorBytes[color]; 
    cmd[2] = node; 
    cmd[3] = interval; 
    cmd[4] = maxNode; 

    return buf;
  }

  buildDynamicCommands(color, node, interval, direction, speed, maxNode, chgDelay): ArrayBuffer {
    let buf = new ArrayBuffer(16);
    let cmd = new Uint16Array(buf);

    cmd[0] = 3; 
    cmd[1] = this.colorBytes[color]; 
    cmd[2] = node; 
    cmd[3] = (interval); 
    cmd[4] = (this.directionBytes[direction]); 
    cmd[5] = (speed); 
    cmd[6] = (maxNode); 
    cmd[7] = (chgDelay); 

    return buf;
  }

  buildRecordedDynamic(record, interval, chg): Array<ArrayBuffer> {
    let cmds = [];

    for (let rec of record) {
      let buf = new ArrayBuffer(18);
      let cmd = new Uint16Array(buf);

      cmd[0] = (0); 
      cmd[1] = (0); 
      cmd[2] = (record.indexOf(rec)); 
      cmd[3] = (this.directionBytes[rec.direction]); 
      cmd[4] = (rec.startAt); 
      cmd[5] = (rec.distance); 
      cmd[6] = (this.colorBytes[rec.color]); 
      cmd[7] = (Math.round(rec.msDelay)); 
      cmd[8] = (0); 

      cmds.push(buf);
    }

    return cmds;

  }



}

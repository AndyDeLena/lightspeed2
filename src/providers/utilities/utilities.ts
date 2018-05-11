import { Injectable } from '@angular/core';

@Injectable()
export class UtilitiesProvider {

  colors: Array<string> = ['red', 'green', 'blue'];

  speedUnitOptions: Array<string> = ['sec', 'mph', 'yd/sec', 'ft/sec', 'm/sec', 'km/h'];

  constructor() {

  }

  stringToNum(str): number {
    return parseFloat(str.substring(0, str.indexOf(" ")));
  }

  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  str2ab(str) {
    var buf = str.length < 20 ? new ArrayBuffer(str.length + 1) : new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);

    for (var z = 0, strLen = str.length; z < strLen; z++) {
      bufView[z] = str.charCodeAt(z);
    }

    if (str.length < 20) {
      bufView[str.length] = 0x7E;
    }

    return buf;
  };

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

  formatColor(color) {
    //GBR color order
    var colors = {
      red: 'AAZ',
      green: 'ZAA',
      blue: 'AZA',
      yellow: 'ZAZ',
      fuchsia: 'AZZ',
      aqua: 'ZZA',
      orange: 'OAZ',
      pink: 'JJZ',
      purple: 'AZM'
    }
    return colors[color];
  }

  calcStartingNode(direct, node): string {
    if (node == 'Start') {
      return '000';
    } else {
      if (direct == 'Forward') {
        return this.lengthify((this.stringToNum(node) * 2), 3);
      } else {
        return this.lengthify((this.stringToNum(node) * 2) - 1, 3);
      }
    }
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

  /**** Two separate functions speedToMsDelay and calcWaitMs because led dashboards use numeric return value from speedToMsDelay *********/

  calcWaitMs(seg): string {
    return this.lengthify(this.speedToMsDelay(seg.speed, seg.unit, seg.distance), 5);
  }

  calcRepeats(dist): string {
    let distInt = this.stringToNum(dist);
    return this.lengthify((distInt * 2) - 1, 5);
  }

  createBleString(seg, startOn): string {
    let ble = 'A';  //A = add segment

    ble += seg.direction.substring(0, 1);
    ble += startOn == 'External trigger' ? 'M' : 'T' //movement or tone (at end of countdown)
    ble += this.calcStartingNode(seg.direction, seg.startAt);
    ble += this.formatColor(seg.color.toLowerCase());
    ble += this.calcWaitMs(seg);
    ble += this.calcRepeats(seg.distance);

    return ble;
  }

}

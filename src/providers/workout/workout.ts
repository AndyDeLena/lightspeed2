import { Injectable } from '@angular/core';

@Injectable()
export class WorkoutProvider {

  //CONFIG VARAIBLES

  //REPS LIST
  /*example =
    [
      {
        type: "Outback",
        data: {
          avatarColor: "rainbow",
          individualSpeeds: false,
          startAt: "0 yards",
          overallSpeed: 10,
          speedUnit: 'sec',
          caption: 'Outback: 20 seconds',
          segments: [
            {
              color: "red",
              direction: "forward",
              distance: "10 yards",
              speed: 5,
              speedUnit: "sec"
            },
            {
              color: "green",
              direction: "backward",
              distance: "10 yards",
              speed: 5,
              speedUnit: "sec"
            }
          ]
        }
      },
      {
        type: "Linear sprint",
        data: {
          avatarColor: "red",
          individualSpeeds: false,
          startAt: "0 yards",
          overallSpeed: 17,
          speedUnit: "mph",
          caption: "40 yards, 17mph",
          segments: [
            {
              color: "red",
              direction: "forward",
              distance: "40 yards",
              speed: 17,
              speedUnit: "mph"
            }
          ]
        }
      }
    ] */

  repsList: Array<any> = [];

  constructor() {

  }

}

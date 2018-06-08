export class Segment {

    //NON WORKOUT SPECIFIC (SAVED WITH REP TYPE)
    color: string
    direction: string
    startAt: string
    distance: string

    //WORKOUT SPECIFIC (USER ENTERS EACH TIME)
    speed: number
    speedUnit: string

    constructor() {
        this.color = "green"
    }

    validate(): boolean {
        return true
    }


}
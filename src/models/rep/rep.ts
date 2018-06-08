import { Segment } from "../segment/segment"

export class Rep {

    //NON WORKOUT SPECFIC (SAVED W/ REP TYPE)
    type: string
    segments: Array<Segment>

    //WORKOUT SPECIFIC (USER ENTERS EACH TIME)
    summary: string
    avatarColor: string

    constructor() { 
    }
    
    validate(): boolean {
        return true
    }


}
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecordPatternPage } from './record-pattern';

@NgModule({
  declarations: [
    RecordPatternPage,
  ],
  imports: [
    IonicPageModule.forChild(RecordPatternPage),
  ],
})
export class RecordPatternPageModule {}

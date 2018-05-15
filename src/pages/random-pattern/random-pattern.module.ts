import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RandomPatternPage } from './random-pattern';

@NgModule({
  declarations: [
    RandomPatternPage,
  ],
  imports: [
    IonicPageModule.forChild(RandomPatternPage),
  ],
})
export class RandomPatternPageModule {}

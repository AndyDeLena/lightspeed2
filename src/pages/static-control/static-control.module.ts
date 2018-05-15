import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StaticControlPage } from './static-control';

@NgModule({
  declarations: [
    StaticControlPage,
  ],
  imports: [
    IonicPageModule.forChild(StaticControlPage),
  ],
})
export class StaticControlPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManualControlPage } from './manual-control';

@NgModule({
  declarations: [
    ManualControlPage,
  ],
  imports: [
    IonicPageModule.forChild(ManualControlPage),
  ],
  exports: [
    ManualControlPage
  ]
})
export class ManualControlPageModule {}

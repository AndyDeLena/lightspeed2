import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DynamicControlPage } from './dynamic-control';

@NgModule({
  declarations: [
    DynamicControlPage,
  ],
  imports: [
    IonicPageModule.forChild(DynamicControlPage),
  ],
})
export class DynamicControlPageModule {}

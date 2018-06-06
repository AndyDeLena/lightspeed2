import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RepModePage } from './rep-mode';

@NgModule({
  declarations: [
    RepModePage,
  ],
  imports: [
    IonicPageModule.forChild(RepModePage),
  ],
  exports: [
    RepModePage
  ]
})
export class RepModePageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RemoteControlPage } from './remote-control';

@NgModule({
  declarations: [
    RemoteControlPage,
  ],
  imports: [
    IonicPageModule.forChild(RemoteControlPage),
  ],
})
export class RemoteControlPageModule {}

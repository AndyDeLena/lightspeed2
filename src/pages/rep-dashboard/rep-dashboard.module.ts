import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RepDashboardPage } from './rep-dashboard';

@NgModule({
  declarations: [
    RepDashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(RepDashboardPage),
  ],
})
export class RepDashboardPageModule {}

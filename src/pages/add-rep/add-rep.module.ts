import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddRepPage } from './add-rep';

@NgModule({
  declarations: [
    AddRepPage,
  ],
  imports: [
    IonicPageModule.forChild(AddRepPage),
  ],
})
export class AddRepPageModule {}

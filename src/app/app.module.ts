import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { TabsPage } from '../pages/tabs/tabs';
import { RepModePage } from '../pages/rep-mode/rep-mode';
import { ManualControlPage } from '../pages/manual-control/manual-control';
import { HelpPage } from '../pages/help/help';
import { BluetoothPage } from '../pages/bluetooth/bluetooth';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ConnectionProvider } from '../providers/connection/connection';
import { AlertsProvider } from '../providers/alerts/alerts';
import { UtilitiesProvider } from '../providers/utilities/utilities';
import { WorkoutProvider } from '../providers/workout/workout';

import { IonicStorageModule } from '@ionic/storage';

import { Keyboard } from '@ionic-native/keyboard';
import { BLE } from '@ionic-native/ble';
import { Insomnia } from '@ionic-native/insomnia';
import { DataProvider } from '../providers/data/data';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    RepModePage,
    ManualControlPage,
    HelpPage,
    BluetoothPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    RepModePage,
    ManualControlPage,
    HelpPage,
    BluetoothPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConnectionProvider,
    AlertsProvider,
    UtilitiesProvider,
    WorkoutProvider,
    BLE,
    Insomnia,
    DataProvider
  ]
})
export class AppModule { }

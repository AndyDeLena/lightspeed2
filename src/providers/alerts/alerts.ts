import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class AlertsProvider {

    constructor(public alertCtrl: AlertController) {

    }

    okAlert(title: string, message?: string): Promise<any> {
        return new Promise(resolve => {
            let okAlert = this.alertCtrl.create({
                title: title,
                message: message,
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            resolve('OK');
                        }
                    }
                ]
            });
            okAlert.present();
        });
    }

    okCancelAlert(title: string, message: string, okReplacement?): Promise<any> {
        let okText = 'OK';
        if (okReplacement) {
            okText = okReplacement;
        }
        return new Promise(resolve => {
            let okAlert = this.alertCtrl.create({
                title: title,
                message: message,
                buttons: [
                    {
                        text: okText,
                        handler: () => {
                            resolve('OK');
                        }
                    },
                    {
                        text: 'Cancel',
                        handler: () => {
                            resolve('Cancel');
                        }
                    }
                ]
            });
            okAlert.present();
        });
    }
}
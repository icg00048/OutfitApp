import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-camera',
  imports: [CommonModule, IonButton, IonIcon, IonSpinner],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent {
  @Output() photoTaken = new EventEmitter<string>();
  public isLoading = false;
  public lastPhoto: string | null = null;

  constructor(private alertCtrl: AlertController) {}

  private async ensureCameraPermission(): Promise<boolean> {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') return true;

    let perms: PermissionStatus = await Camera.checkPermissions();
    if (perms.camera === 'granted') return true;

    perms = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    if (perms.camera === 'granted') return true;

    await this.simpleAlert(
      'Camera Permission',
      'To take photos, please enable camera access in System Settings.'
    );
    return false;
  }

  private withTimeout<T>(p: Promise<T>, ms = 12000, label = 'operation'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`Timeout waiting for ${label} (${ms}ms)`)), ms);
      p.then(
        (v) => { clearTimeout(t); resolve(v); },
        (e) => { clearTimeout(t); reject(e); }
      );
    });
  }

  private async simpleAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await alert.present();
  }

  async takePhoto() {
    this.isLoading = true;
    const platform = Capacitor.getPlatform();
    try {
      const ok = await this.ensureCameraPermission();
      if (!ok) { this.isLoading = false; return; }

      try {
        const image = await this.withTimeout(
          Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera, 
          }),
          12000,
          'Camera.getPhoto(Camera)'
        );

        if (image?.webPath) {
          this.lastPhoto = image.webPath;
          this.photoTaken.emit(image.webPath);
          this.isLoading = false;
          return;
        }
      } catch (firstErr) {
        console.warn('Direct camera attempt failed:', firstErr);

        try {
          const image = await this.withTimeout(
            Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.Uri,
              source: CameraSource.Prompt,
              promptLabelHeader: 'Select source',
              promptLabelPhoto: 'Photo Library',
              promptLabelPicture: 'Camera',
              promptLabelCancel: 'Cancel',
            }),
            12000,
            'Camera.getPhoto(Prompt)'
          );

          if (image?.webPath) {
            this.lastPhoto = image.webPath;
            this.photoTaken.emit(image.webPath);
            this.isLoading = false;
            return;
          }

          // No image returned
          await this.simpleAlert('No image', 'No image file was obtained.');
          this.isLoading = false;
          return;
        } catch (secondErr) {
          console.warn('Prompt attempt also failed:', secondErr);
          await this.simpleAlert(
            'Could not open the camera',
            `Details: ${typeof secondErr === 'string' ? secondErr : (secondErr || JSON.stringify(secondErr))}`
          );
          this.isLoading = false;
          return;
        }
      }
    } catch (err) {
      console.warn('General error in takePhoto:', err);
      await this.simpleAlert(
        'Error',
        `An unexpected error occurred.\n\n${typeof err === 'string' ? err : (err || JSON.stringify(err))}`
      );
      this.isLoading = false;
      return;
    }
  }
}

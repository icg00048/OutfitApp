import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  IonButton,
  IonIcon,
  IonContent,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { ItemService } from '../../service/item/item.service';

@Component({
  selector: 'app-camera',
  imports: [CommonModule, IonButton, IonIcon, IonContent],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent {
  @Output() photoTaken = new EventEmitter<number>();

  public isOpeningPicker = false;
  public isProcessing = false;

  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private itemService = inject(ItemService);

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

  private async simpleAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await alert.present();
  }

  private async showToast(message: string, duration = 2500) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
    });
    await toast.present();
  }

  async startCaptureFlow() {
    if (this.isOpeningPicker || this.isProcessing) return;

    const ok = await this.ensureCameraPermission();
    if (!ok) return;

    const alert = await this.alertCtrl.create({
      header: 'Select image source',
      message: 'Where do you want to get the photo from?',
      buttons: [
        { text: 'Camera', handler: () => this.captureFrom(CameraSource.Camera) },
        { text: 'Photo Library', handler: () => this.captureFrom(CameraSource.Photos) },
        { text: 'Cancel', role: 'cancel' },
      ],
    });

    await alert.present();
  }

  private async captureFrom(source: CameraSource) {
    if (this.isProcessing) return;

    this.isOpeningPicker = true;

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source,
      });

      if (!image?.webPath) {
        await this.simpleAlert('No image selected', 'No image was obtained.');
        return;
      }

      await this.processImageWithBlockingPopup(image.webPath);

    } catch (err) {
      await this.simpleAlert(
        'Could not open the camera',
        `Details: ${typeof err === 'string' ? err : JSON.stringify(err)}`
      );
    } finally {
      this.isOpeningPicker = false;
    }
  }

  private async processImageWithBlockingPopup(imagePath: string) {
    this.isProcessing = true;

    const loading = await this.loadingCtrl.create({
      message: 'Processing image… Please wait.',
      backdropDismiss: false,
    });

    await loading.present();

    try {
      const imageFile = await this.normalizeImageToJpeg(imagePath);

      await new Promise<void>((resolve, reject) => {
        this.itemService.createItem({}, imageFile, true).subscribe({
          next: (item) => {
            this.photoTaken.emit(item.id);
            resolve();
          },
          error: (err) => reject(err),
        });
      });

      await loading.dismiss();
      await this.showToast('Garment added successfully.', 2000);

    } catch (err) {
      console.error('Error processing image:', err);
      await loading.dismiss();
      await this.simpleAlert(
        'Processing failed',
        'We could not process your image. Please try again.'
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
  }

  private async normalizeImageToJpeg(uri: string): Promise<File> {
    const blob = await this.uriToBlob(uri);
    const img = await this.blobToImage(blob);

    const maxSide = 1600;
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;

    const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
    const dstW = Math.max(1, Math.round(srcW * scale));
    const dstH = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = dstW;
    canvas.height = dstH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available on this device');

    ctx.drawImage(img, 0, 0, dstW, dstH);

    const jpegBlob = await this.canvasToJpegBlob(canvas, 0.85);

    return new File([jpegBlob], 'photo.jpg', { type: 'image/jpeg' });
  }


  private blobToImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image decoding failed (possibly unsupported format).'));
      };

      img.src = url;
    });
  }

  private canvasToJpegBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('JPEG conversion failed'))),
        'image/jpeg',
        quality
      );
    });
  }
}

import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {

  async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        return await this.getWithCapacitor();
      }

      return await this.getWithBrowser();
    } catch (err) {
      console.warn('[Location] unavailable, continuing without location', err);
      return null;
    }
  }

  private async getWithCapacitor(): Promise<UserLocation | null> {
    try {
      const position = await this.withTimeout(
        Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10 * 60 * 1000,
        }),
        16000
      );

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      console.warn('[Location] Capacitor geolocation failed/timeout', err);
      return null;
    }
  }

  private getWithBrowser(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      let done = false;

      const manualTimeout = setTimeout(() => {
        if (done) return;
        done = true;
        console.warn('[Location] Browser geolocation manual timeout');
        resolve(null);
      }, 16000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (done) return;
          done = true;
          clearTimeout(manualTimeout);

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (done) return;
          done = true;
          clearTimeout(manualTimeout);

          console.warn('[Location] Browser geolocation failed', error);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10 * 60 * 1000,
        }
      );
    });
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Location timeout'));
      }, ms);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}
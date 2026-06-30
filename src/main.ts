import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { HttpLoggingInterceptor } from './app/http-logging.interceptor';

import { addIcons } from 'ionicons';
import {
  sparklesOutline,
  shuffleOutline,
  downloadOutline,
  closeCircleOutline,
  arrowBackOutline,
  imageOutline,
} from 'ionicons/icons';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: HttpLoggingInterceptor, multi: true },
  ],
});

addIcons({
  'sparkles-outline': sparklesOutline,
  'shuffle-outline': shuffleOutline,
  'download-outline': downloadOutline,
  'close-circle-outline': closeCircleOutline,
  'arrow-back-outline': arrowBackOutline,
  'image-outline': imageOutline,
});

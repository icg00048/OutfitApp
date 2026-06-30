import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OutfitCandidateResponseDto } from '../../model/outfit.model';
import { LocationService } from '../location.service';

@Injectable({ providedIn: 'root' })
export class OutfitRecommendationService {
  private http = inject(HttpClient);
  private locationService = inject(LocationService);

  getRecommendations(params: {
    occasion?: string | null;
    limit?: number | null;
  }): Observable<OutfitCandidateResponseDto[]> {
    return from(this.locationService.getCurrentLocation()).pipe(
      catchError((err) => {
        console.warn('[Recommendations] location failed, using null coords', err);
        return of(null);
      }),
      switchMap((location) => {
        const body = {
          occasion: params.occasion ?? null,
          limit: params.limit ?? 10,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        };

        console.log('[Recommendations] POST body', body);

        return this.http.post<OutfitCandidateResponseDto[]>(
          `${environment.apiBaseUrl}/api/outfits/recommendations`,
          body
        );
      }),
      timeout(25000)
    );
  }
}
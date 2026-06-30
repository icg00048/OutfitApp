import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RecommendationRequest, RecommendationDto, SaveOutfitRequest, SaveOutfitResponse } from '../../model/outfit.model';

@Injectable({ providedIn: 'root' })
export class OutfitService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl ?? 'http://localhost:8080';
  private outfitsChanged = new Subject<void>();
  public outfitsChanged$ = this.outfitsChanged.asObservable();

  getRecommendations(request: RecommendationRequest): Observable<RecommendationDto[]> {
    return this.http.post<RecommendationDto[]>(
      `${this.api}/api/outfits/recommendations`,
      request
    );
  }

  saveOutfit(body: SaveOutfitRequest): Observable<SaveOutfitResponse> {
    return this.http.post<SaveOutfitResponse>(
      `${this.api}/api/outfits/save`,
      body
    ).pipe(
      tap(() => this.outfitsChanged.next())
    );
  }

  getAllOutfits(): Observable<SaveOutfitResponse[]> {
    return this.http.get<SaveOutfitResponse[]>(
      `${this.api}/api/outfits`
    );
  }

  deleteOutfit(outfitId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/api/outfits/${outfitId}`)
      .pipe(
        tap(() => this.outfitsChanged.next())
      );
  }
}

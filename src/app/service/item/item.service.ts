import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap, catchError, Subject } from 'rxjs';
import { throwError } from 'rxjs';
import { Item } from 'src/app/model/item.model';
import { environment } from 'src/environments/environment';
import { BackendItem, toFrontItem } from './api-item.adapter';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private api = environment.apiBaseUrl ?? 'http://localhost:8080';
  private itemsChanged = new Subject<void>();
  public itemsChanged$ = this.itemsChanged.asObservable();

  constructor(private http: HttpClient) {}

  getItems(opts?: { q?: string; category?: string; tag?: string }): Observable<Item[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.category) params = params.set('category', opts.category);
    if (opts?.tag) params = params.set('tag', opts.tag);

    return this.http.get<BackendItem[]>(`${this.api}/api/items`, { params })
      .pipe(
        tap((response) => {
          console.log('[ItemService] Raw getItems response:', response);
          if (!Array.isArray(response)) {
            console.error(
              '[ItemService] getItems response is not an array!',
              'Type:', typeof response,
              'Value:', response
            );
          } else {
            console.log('[ItemService] getItems is valid array, length:', response.length);
          }
        }),
        map((items) => {
          // Safety check: ensure items is array
          if (!Array.isArray(items)) {
            console.error('[ItemService] getItems map: items is not array, returning empty');
            return [];
          }
          return items.map(toFrontItem);
        }),
        catchError((error) => {
          console.error('[ItemService] getItems error:', error);
          return throwError(() => error);
        })
      );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/api/items/categories`)
      .pipe(
        map((categories) => {
          if (!Array.isArray(categories)) {
            console.error('[ItemService] getCategories response is not an array', categories);
            return [];
          }
          return categories.map((category) => category.toString());
        }),
        catchError((error) => {
          console.error('[ItemService] getCategories error:', error);
          return throwError(() => error);
        })
      );
  }

  getColors(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/api/items/colors`)
      .pipe(
        map((colors) => {
          if (!Array.isArray(colors)) {
            console.error('[ItemService] getColors response is not an array', colors);
            return [];
          }

          return colors.map((color) => color.toString());
        }),
        catchError((error) => {
          console.error('[ItemService] getColors error:', error);
          return throwError(() => error);
        })
      );
  }


  getItem(id: number): Observable<Item> {
    return this.http.get<BackendItem>(`${this.api}/api/items/${id}`)
      .pipe(
        tap((response) => {
          console.log('[ItemService] Raw getItem response for id', id, ':', response);
        }),
        map(toFrontItem),
        catchError((error) => {
          console.error('[ItemService] getItem error for id', id, ':', error);
          return throwError(() => error);
        })
      );
  }

  createItem(
    data: {
      name?: string;
      category?: string;
      color?: string;
      tags?: string[];
      description?: string;
    },
    image?: File,
    analyze = true
  ): Observable<Item> {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) fd.append('image', image, image.name);

    return this.http.post<BackendItem>(`${this.api}/api/items`, fd, {
      params: new HttpParams().set('analyze', String(analyze))
    })
      .pipe(
        tap((response) => {
          console.log('[ItemService] Raw createItem response:', response);
          this.itemsChanged.next();
        }),
        map(toFrontItem),
        catchError((error) => {
          console.error('[ItemService] createItem error:', error);
          return throwError(() => error);
        })
      );
  }

  updateItem(
    id: number,
    data: {
      name?: string;
      category?: string;
      color?: string;
      tags?: string[];
      description?: string | null;
    }
  ): Observable<Item> {
    return this.http.put<BackendItem>(`${this.api}/api/items/${id}`, data)
      .pipe(
        tap((response) => {
          console.log('[ItemService] Raw updateItem response:', response);
          this.itemsChanged.next();
        }),
        map(toFrontItem),
        catchError((error) => {
          console.error('[ItemService] updateItem error:', error);
          return throwError(() => error);
        })
      );
  }

  deleteItem(id: number) {
    return this.http.delete<void>(`${this.api}/api/items/${id}`)
      .pipe(
        tap(() => {
          console.log(`[ItemService] deleted item ${id}`);
          this.itemsChanged.next();
        }),
        catchError((error) => {
          console.error('[ItemService] deleteItem error:', error);
          return throwError(() => error);
        })
      );
  }
}

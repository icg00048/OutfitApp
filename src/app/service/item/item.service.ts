import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Item } from 'src/app/model/item.model';
import { environment } from 'src/environments/environment';
import { BackendItem, toFrontItem } from './api-item.adapter';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private api = environment.apiBaseUrl ?? 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getItems(opts?: { q?: string; category?: string; tag?: string }): Observable<Item[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.category) params = params.set('category', opts.category);
    if (opts?.tag) params = params.set('tag', opts.tag);

    return this.http.get<BackendItem[]>(`${this.api}/api/items`, { params })
      .pipe(map(items => items.map(toFrontItem)));
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<BackendItem>(`${this.api}/api/items/${id}`)
      .pipe(map(toFrontItem));
  }

  createItem(data: {
    name?: string;
    category?: string;
    color?: string;
    tags?: string[];
    description?: string;
  }, image?: File, analyze = true): Observable<Item> {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) fd.append('image', image, image.name);

    return this.http.post<BackendItem>(`${this.api}/api/items`, fd, {
      params: new HttpParams().set('analyze', String(analyze))
    }).pipe(map(toFrontItem));
  }
}

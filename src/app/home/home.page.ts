import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonContent, IonSearchbar, InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Item } from '../model/item.model';
import { ItemService } from '../service/item/item.service';
import { ItemCardComponent } from '../shared/item-card/item-card.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSearchbar,
    ItemCardComponent
  ],
})
export class HomePage {
  private itemService = inject(ItemService);

  isLoading = false;
  error: string | null = null;

  // si más adelante metemos paginación real del backend, lo reactivamos
  // private currentPage = 1;

  items: Item[] = [];
  searchTerm = '';

  constructor() {
    this.loadItems();
  }

  loadItems(event?: InfiniteScrollCustomEvent) {
    this.error = null;
    if (!event) this.isLoading = true;

    this.itemService.getItems()
      .pipe(
        catchError((err: any) => {
          console.error(err);
          this.error = err?.message ?? 'Error loading items';
          return of([] as Item[]);
        }),
        finalize(() => {
          this.isLoading = false;
          event?.target.complete();
        })
      )
      .subscribe(list => this.items = list);
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    // de momento no hay paginación en el backend; completa sin hacer nada
    event.target.complete();
  }

  get filteredItems(): Item[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.items;

    return this.items.filter(item => {
      const {
        nickname,
        type,
        primaryColor,
        secondaryColor,
        pattern,
        material,
        subcategory,
        occasions,
        seasons,
        details
      } = item;

      const haystack = [
        nickname,
        type,
        primaryColor,
        secondaryColor ?? '',
        pattern,
        material ?? '',
        subcategory ?? '',
        ...(occasions ?? []),
        ...(seasons ?? []),
        ...(details ? Object.values(details) : [])
      ].join(' ').toLowerCase();

      return haystack.includes(term);
    });
  }
}

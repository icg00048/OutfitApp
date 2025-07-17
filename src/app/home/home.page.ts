import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonContent, IonSearchbar, InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Item } from '../model/item.model';
import { ItemService } from '../service/item/item.service';
import { ItemCardComponent } from '../shared/item-card/item-card.component';
import { catchError, finalize } from 'rxjs';

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
  public isLoading = false;
  private currentPage = 1;
  private error = null;


  items: Item[] = [];
  searchTerm = '';

  constructor() {
    this.loadItems();
  }

  loadItems(event?: InfiniteScrollCustomEvent) {
    this.error = null;

    if(!event){
      this.isLoading = true;
    }

    this.itemService.getItems(this.currentPage)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if(event){
            event.target.complete();
          }
        }),
        catchError((err: any) => {
          console.log(err);
          this.error = err.error.status_message;
          return [];
        })
      )
      .subscribe(list => this.items = list);
  }

  loadMore(event: InfiniteScrollCustomEvent){

  }

  get filteredItems(): Item[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.items;
    }
  
    return this.items.filter(item => {
      const {
        nickname,
        type,
        primaryColor,
        secondaryColor = '',
        pattern,
        material = '',
        subcategory = '',
        occasion = '',
        season = ''
      } = item;
  
      const haystack = [
        nickname,
        type,
        primaryColor,
        secondaryColor,
        pattern,
        material,
        subcategory,
        occasion,
        season
      ].map(val => val.toString().toLowerCase()).join(' ');
  
      return haystack.includes(term);
    });
  }
}

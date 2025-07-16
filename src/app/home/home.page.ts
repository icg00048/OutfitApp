import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem
} from '@ionic/angular/standalone';

import { Item } from '../model/item.model';
import { ItemService } from '../service/item/item.service';

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
    IonList,
    IonItem
  ],
})
export class HomePage {
  private itemService = inject(ItemService);
  items: Item[] = [];
  searchTerm = '';

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService
      .getItems()
      .subscribe(list => this.items = list);
  }

  get filteredItems(): Item[] {
    const term = this.searchTerm.trim().toLowerCase();
    return term
      ? this.items.filter(i => i.nickname.toLowerCase().includes(term))
      : this.items;
  }
}

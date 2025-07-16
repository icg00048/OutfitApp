import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item, GarmentType, Pattern, Season, Occasion, Subcategory } from 'src/app/model/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private mockItems: Item[] = [
    {
      id: 1,
      nickname: 'Blusa veraniega',
      type: GarmentType.Shirt,
      primaryColor: 'blanco',
      pattern: Pattern.Solid,
      material: 'algodón',
      occasion: Occasion.Casual,
      season: Season.Summer,
    },
    {
      id: 2,
      nickname: 'Chaqueta vaquera',
      type: GarmentType.Jacket,
      primaryColor: 'azul denim',
      pattern: Pattern.Solid,
      material: 'denim',
      occasion: Occasion.Casual,
      season: Season.Winter,
    },
    {
      id: 3,
      nickname: 'Pantalones de vestir',
      type: GarmentType.Pants,
      primaryColor: 'negro',
      pattern: Pattern.Solid,
      material: 'poliéster',
      subcategory: Subcategory.Loafers,
      occasion: Occasion.Formal,
      season: Season.AllYear,
    },
  ];

  constructor() { }

  getItems(): Observable<Item[]> {
    return of(this.mockItems);
  }

}

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
      nickname: 'hoodie',
      type: GarmentType.Hoodie,
      primaryColor: 'blue',
      secondaryColor: 'white',
      pattern: Pattern.Solid,
      material: 'cotton',
      occasion: Occasion.Casual,
      season: Season.Winter,
      imageUrl: 'https://images.jackjones.com/12254759/4470970/001/jjxx-jxsophitrenchcoatotwnoos-beige.png?v=82d0bc4ea37a20761a88536069ea57dc&format=webp&width=1280&quality=90&key=25-0-3'
    },
    {
      id: 2,
      nickname: 'T-shirt',
      type: GarmentType.Shirt,
      primaryColor: 'green',
      pattern: Pattern.Solid,
      material: 'cotton',
      occasion: Occasion.Casual,
      season: Season.Summer,
      imageUrl: 'https://commonsmx.com/cdn/shop/files/123_bc64c79d-c698-4018-9999-893fc853313c.png?v=1722572124&width=640'
    },
    {
      id: 3,
      nickname: 'Jeans',
      type: GarmentType.Pants,
      primaryColor: 'blue',
      pattern: Pattern.Solid,
      material: 'poliéster',
      occasion: Occasion.Casual,
      season: Season.AllYear,
      imageUrl: 'https://stayhard.com/cdn/shop/products/60875-80_002.png?v=1670297881&width=600'
    },
    {
      id: 4,
      nickname: 'dunks',
      type: GarmentType.Sneakers,
      primaryColor: 'black',
      secondaryColor: 'white',
      pattern: Pattern.Solid,
      subcategory: Subcategory.Running,
      occasion: Occasion.Sporty,
      season: Season.AllYear,
      imageUrl: 'https://www.dropit-shop.de/cdn/shop/products/Nike_Dunk_Low_Retro_White_Black_Panda_01_Dropit.png?v=1723224524'
    },
    {
      id: 5,
      nickname: 'cap',
      type: GarmentType.Dress,
      primaryColor: 'black',
      secondaryColor: 'brown',
      pattern: Pattern.Solid,
      subcategory: Subcategory.Running,
      occasion: Occasion.Casual,
      season: Season.Summer,
      imageUrl: 'https://ryzon.net/cdn/shop/products/8710_Aura_Performance_Snapback_Cap_2021_KB_1024x1024_86eb4588-1fbf-4620-92c5-4b673f94431b_cutout.png?v=1743082618'
    },
    {
      id: 6,
      nickname: 'german jacket',
      type: GarmentType.Jacket,
      primaryColor: 'black',
      secondaryColor: 'multicolor',
      pattern: Pattern.Solid,
      occasion: Occasion.Sporty,
      season: Season.Winter,
      imageUrl: 'https://stefanssoccer.com/cdn/shop/files/IU2086_b2b020_pdp_clipped_rev_1.png?v=1729112601'
    },
    {
      id: 7,
      nickname: 'dunks',
      type: GarmentType.Sneakers,
      primaryColor: 'black',
      secondaryColor: 'white',
      pattern: Pattern.Solid,
      subcategory: Subcategory.Running,
      occasion: Occasion.Sporty,
      season: Season.AllYear,
      imageUrl: 'https://i.supersales.de/p/dr-martens-1460.png?imgid=zWaYREVV86C4BSXILBKWyUXwBxN3Pv-mS3lnmRDevYA/q:90/crop:1600:1600:nowe:0:0/h:400/aHR0cHM6Ly9zdXBlcnNhbGVzLmFtczMuY2RuLmRpZ2l0YWxvY2VhbnNwYWNlcy5jb20vMGM1YTg5M2ItZDc5Ny00NGI5LWIyNmEtNGJhN2YxNjk1ZmFmL2RyLW1hcnRlbnMtMTQ2MC5wbmc.png'
    },
  ];  

  constructor() { }

  getItems(page = 1): Observable<Item[]> {
    return of(this.mockItems);
  }

}

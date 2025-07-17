export enum GarmentType {
    Shirt = 'shirt',
    Tshirt = 'tshirt',
    Hoodie = 'hoodie',
    Pants = 'pants',
    Dress = 'dress',
    Jacket = 'jacket',
    Sneakers = 'sneakers',
  }
  
  export enum Pattern {
    Solid = 'solid',
    Stripes = 'stripes',
    Checks = 'checks',
    Floral = 'floral',
  }
  
  export enum Season {
    Summer = 'summer',
    Winter = 'winter',
    AllYear = 'all_year',
  }
  
  export enum Occasion {
    Formal = 'formal',
    Casual = 'casual',
    Sporty = 'sporty',
    Business = 'business',
  }
  
  export enum Subcategory {
    Running = 'running',
    Loafers = 'loafers',
    Boots = 'boots',
  }
  

  export interface Item {
    id: number;
    imageUrl: string;
    nickname: string;
  
    type: GarmentType;
    primaryColor: string; 
    secondaryColor?: string;
    pattern: Pattern;
  
    material?: string; 
    subcategory?: Subcategory;
    occasion?: Occasion;
    season?: Season;
  }
  
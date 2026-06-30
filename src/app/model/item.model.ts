export enum GarmentType {
  Tshirt = 'tshirt',
  Shirt = 'shirt',
  Jersey = 'jersey',
  Polo = 'polo',
  Hoodie = 'hoodie',
  Sweater = 'sweater',
  Cardigan = 'cardigan',
  Vest = 'vest',

  Jacket = 'jacket',
  VarsityJacket = 'varsity_jacket',
  PufferJacket = 'puffer_jacket',
  Bomber = 'bomber',
  Blazer = 'blazer',
  Coat = 'coat',
  Trench = 'trench',
  Parka = 'parka',
  Raincoat = 'raincoat',

  Jeans = 'jeans',
  Trousers = 'trousers',
  Chinos = 'chinos',
  Shorts = 'shorts',
  Skirt = 'skirt',
  Leggings = 'leggings',

  Dress = 'dress',
  Jumpsuit = 'jumpsuit',

  Sneakers = 'sneakers',
  Boots = 'boots',
  Loafers = 'loafers',
  Sandals = 'sandals',
  Heels = 'heels',
  DressShoes = 'dress_shoes',
  Trainers = 'trainers',

  Cap = 'cap',
  Hat = 'hat',
  Beanie = 'beanie',
  Scarf = 'scarf',
  Gloves = 'gloves',
  Belt = 'belt',
  Bag = 'bag',
  Backpack = 'backpack',
  Sunglasses = 'sunglasses',
}

export enum Pattern {
  Solid = 'solid',
  Stripes = 'stripes',
  Checks = 'checks',
  Printed = 'printed',
  Logo = 'logo',
  Colorblock = 'colorblock',
  Camo = 'camo',
  PolkaDots = 'polka_dots',
  Houndstooth = 'houndstooth',
  Ribbed = 'ribbed',
  Quilted = 'quilted',
  Textured = 'textured',
  None = 'none',
  Unknown = 'unknown',
}

export enum Season {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
  AllYear = 'all_year',
}

export enum Occasion {
  Casual = 'casual',
  Formal = 'formal',
  Work = 'work',
  Business = 'business',
  Sport = 'sport',
  Outdoor = 'outdoor',
  Streetwear = 'streetwear',
  Party = 'party',
  Travel = 'travel',
  Athleisure = 'athleisure',
}

export enum Subcategory {
  Running = 'running',
  Hiking = 'hiking',
  Basketball = 'basketball',
  Soccer = 'soccer',
  Loafers = 'loafers',
  Boots = 'boots',
  Sandals = 'sandals',
  DressShoes = 'dress_shoes',

  Varsity = 'varsity',
  Puffer = 'puffer',
  Bomber = 'bomber',
  Trench = 'trench',
  Rain = 'rain',
}

export enum Category {
  Top = 'top',
  Bottom = 'bottom',
  Outerwear = 'outerwear',
  Shoes = 'shoes',
}

export enum Color {
  Black = 'black',
  White = 'white',
  Gray = 'gray',
  Red = 'red',
  Blue = 'blue',
  Navy = 'navy',
  Green = 'green',
  Beige = 'beige',
  Brown = 'brown',
  Pink = 'pink',
  Purple = 'purple',
  Yellow = 'yellow',
  Orange = 'orange',
}

export interface TemperatureRange {
  min?: number;
  max?: number;
}

export interface Item {
  id: number;
  imageUrl: string | null;
  nickname: string;

  category: Category;

  type: GarmentType;

  primaryColor: Color;
  secondaryColor: Color | null;

  pattern: Pattern | null;

  material?: string | null;
  subcategory?: Subcategory | null;

  occasions: Occasion[];
  seasons: Season[];

  tempRange?: TemperatureRange;

  details?: Record<string, string | number | boolean | null>;
  description?: string | null;
  tags?: string[];
}

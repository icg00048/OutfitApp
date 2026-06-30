import {
    Item as FrontItem,
    GarmentType,
    Pattern,
    Season,
    Occasion,
    Subcategory,
    Category,
    Color,
} from 'src/app/model/item.model';
import { environment } from 'src/environments/environment';

export type BackendCategory =
    | 'TOP'
    | 'BOTTOM'
    | 'OUTERWEAR'
    | 'FOOTWEAR'
    | 'ACCESSORY'
    | 'DRESS'
    | 'UNKNOWN';

export type BackendSeason = 'SPRING'|'SUMMER'|'AUTUMN'|'WINTER';
export type BackendOccasion = 'CASUAL'|'FORMAL'|'WORK'|'SPORT'|'PARTY'|'OUTDOOR'|'STREETWEAR'|'TRAVEL';

export interface BackendItem {
    id: number;
    name: string;
    category: BackendCategory;
    color: string | null;
    tags: string[];
    imageUrl: string | null;
    description: string | null;
    details: Record<string, string> | null;
    seasons: BackendSeason[] | null;
    occasions: BackendOccasion[] | null;
    createdAt: string;
}

const apiBase = environment.apiBaseUrl ?? '';
const fullImageUrl = (u: string | null) =>
    !u ? null : (/^https?:\/\//i.test(u) ? u : `${apiBase}${u.startsWith('/') ? u : `/${u}`}`);

const normalizeColor = (c?: string | null): Color => {
    const v = (c ?? '').trim().toLowerCase();
    switch (v) {
        case 'black': return Color.Black;
        case 'white': return Color.White;
        case 'gray': return Color.Gray;
        case 'red': return Color.Red;
        case 'blue': return Color.Blue;
        case 'navy': return Color.Navy;
        case 'green': return Color.Green;
        case 'beige': return Color.Beige;
        case 'brown': return Color.Brown;
        case 'pink': return Color.Pink;
        case 'purple': return Color.Purple;
        case 'yellow': return Color.Yellow;
        case 'orange': return Color.Orange;
        default:
        return Color.Gray;
    }
};

const mapCategory = (c?: BackendCategory | string | null): Category => {
    const value = (c ?? '').toString().trim().toUpperCase();
    switch (value) {
        case 'TOP': return Category.Top;
        case 'BOTTOM': return Category.Bottom;
        case 'OUTERWEAR': return Category.Outerwear;
        case 'FOOTWEAR':
        case 'SHOES': return Category.Shoes;
        case 'ACCESSORY': return Category.Top;
        case 'DRESS': return Category.Top;
        default: return Category.Top;
    }
};

export const toFrontCategory = (c?: BackendCategory | string | null): Category => mapCategory(c);


function mapType(detailsType?: string, category?: BackendCategory): GarmentType {
    const t = (detailsType ?? '').toLowerCase().trim();

    if (t.includes('varsity')) return GarmentType.VarsityJacket;
    if (t.includes('puffer')) return GarmentType.PufferJacket;
    if (t.includes('bomber')) return GarmentType.Bomber;
    if (t.includes('blazer')) return GarmentType.Blazer;
    if (t.includes('trench')) return GarmentType.Trench;
    if (t.includes('parka')) return GarmentType.Parka;
    if (t.includes('rain')) return GarmentType.Raincoat;
    if (t.includes('coat')) return GarmentType.Coat;
    if (t.includes('jacket')) return GarmentType.Jacket;

    if (t.includes('t_shirt') || t === 'tshirt' || t === 'tee') return GarmentType.Tshirt;
    if (t.includes('polo')) return GarmentType.Polo;
    if (t.includes('hoodie')) return GarmentType.Hoodie;
    if (t.includes('sweatshirt')) return GarmentType.Sweater;
    if (t.includes('sweater')) return GarmentType.Sweater;
    if (t.includes('cardigan')) return GarmentType.Cardigan;
    if (t.includes('shirt')) return GarmentType.Shirt;
    if (t.includes('jersey')) return GarmentType.Jersey;
    if (t.includes('vest')) return GarmentType.Vest;

    if (t.includes('jeans')) return GarmentType.Jeans;
    if (t.includes('trousers') || t.includes('pants')) return GarmentType.Trousers;
    if (t.includes('chinos')) return GarmentType.Chinos;
    if (t.includes('short')) return GarmentType.Shorts;
    if (t.includes('skirt')) return GarmentType.Skirt;
    if (t.includes('legging')) return GarmentType.Leggings;

    if (t.includes('dress')) return GarmentType.Dress;
    if (t.includes('jumpsuit')) return GarmentType.Jumpsuit;

    if (t.includes('sneaker')) return GarmentType.Sneakers;
    if (t.includes('boot')) return GarmentType.Boots;
    if (t.includes('loafer')) return GarmentType.Loafers;
    if (t.includes('sandal')) return GarmentType.Sandals;
    if (t.includes('heel')) return GarmentType.Heels;
    if (t.includes('dress_shoes')) return GarmentType.DressShoes;
    if (t.includes('trainer')) return GarmentType.Trainers;

    switch (category) {
        case 'OUTERWEAR': return GarmentType.Jacket;
        case 'BOTTOM': return GarmentType.Trousers;
        case 'FOOTWEAR': return GarmentType.Sneakers;
        case 'DRESS': return GarmentType.Dress;
        case 'TOP':
        default: return GarmentType.Shirt;
    }
}

function mapSubcategory(detailsType?: string): Subcategory | null {
    const t = (detailsType ?? '').toLowerCase();
    if (t.includes('varsity')) return Subcategory.Varsity;
    if (t.includes('puffer')) return Subcategory.Puffer;
    if (t.includes('bomber')) return Subcategory.Bomber;
    if (t.includes('trench')) return Subcategory.Trench;
    if (t.includes('rain')) return Subcategory.Rain;

    if (t.includes('running')) return Subcategory.Running;
    if (t.includes('hiking')) return Subcategory.Hiking;
    if (t.includes('basketball')) return Subcategory.Basketball;
    if (t.includes('soccer') || t.includes('football')) return Subcategory.Soccer;

    if (t.includes('loafer')) return Subcategory.Loafers;
    if (t.includes('boot')) return Subcategory.Boots;
    if (t.includes('dress_shoes')) return Subcategory.DressShoes;
    if (t.includes('sandal')) return Subcategory.Sandals;

    return null;
}

function mapPattern(p?: string, quiltedFlag?: string): Pattern | null {
  const v = (p ?? '').toLowerCase().trim();
  const quilted = (quiltedFlag ?? '').toLowerCase() === 'true';

  if (quilted) return Pattern.Quilted;

  if (!v || v === 'unknown') return null;
  if (v === 'none') return Pattern.None;
  if (v === 'solid') return Pattern.Solid;
  if (v === 'striped' || v === 'stripes') return Pattern.Stripes;
  if (v === 'plaid' || v === 'check' || v === 'checked' || v === 'checks') return Pattern.Checks;
  if (v === 'logo') return Pattern.Logo;
  if (v === 'colorblock') return Pattern.Colorblock;
  if (v === 'camo' || v === 'camouflage') return Pattern.Camo;
  if (v === 'polka' || v === 'polka_dots' || v === 'dots') return Pattern.PolkaDots;
  if (v === 'houndstooth') return Pattern.Houndstooth;
  if (v === 'ribbed') return Pattern.Ribbed;
  if (v === 'textured') return Pattern.Textured;
  if (v === 'printed') return Pattern.Printed;

  return null;
}

function mapSeasons(arr?: BackendSeason[] | null): Season[] {
  const out = new Set<Season>();
  (arr ?? []).forEach(s => {
    switch (s) {
      case 'SPRING': out.add(Season.Spring); break;
      case 'SUMMER': out.add(Season.Summer); break;
      case 'AUTUMN': out.add(Season.Autumn); break;
      case 'WINTER': out.add(Season.Winter); break;
    }
  });
  return Array.from(out);
}

function mapOccasions(arr?: BackendOccasion[] | null): Occasion[] {
  const out = new Set<Occasion>();
  (arr ?? []).forEach(o => {
    switch (o) {
      case 'CASUAL': out.add(Occasion.Casual); break;
      case 'FORMAL': out.add(Occasion.Formal); break;
      case 'WORK': out.add(Occasion.Work); break;
      case 'SPORT': out.add(Occasion.Sport); break;
      case 'PARTY': out.add(Occasion.Party); break;
      case 'OUTDOOR': out.add(Occasion.Outdoor); break;
      case 'STREETWEAR': out.add(Occasion.Streetwear); break;
      case 'TRAVEL': out.add(Occasion.Travel); break;
    }
  });
  return Array.from(out);
}

export function toFrontItem(b: BackendItem): FrontItem {
    const d = b.details ?? {};

    const primaryColor = normalizeColor(b.color ?? d['primary_color']);
    const secondaryColorRaw = d['secondary_color'];

    const secondaryColorToken = secondaryColorRaw
    ? secondaryColorRaw
        .split(/[,\|\/]/)
        .map(x => x.trim())
        .filter(Boolean)[0]
    : null;

    const invalidTokens = new Set(['none', 'null', 'unknown', 'n/a', '']);
    const secondaryColor =
    secondaryColorToken && !invalidTokens.has(secondaryColorToken.toLowerCase())
        ? normalizeColor(secondaryColorToken)
        : null;


    const type = mapType(d['type'], b.category);
    const pattern = mapPattern(d['pattern'], d['quilted']);
    const seasons = mapSeasons(b.seasons);
    const occasions = mapOccasions(b.occasions);

    return {
        id: b.id,
        imageUrl: fullImageUrl(b.imageUrl),
        nickname: b.name || '',
        category: mapCategory(b.category),
        type,
        primaryColor,
        secondaryColor,
        pattern,
        material: d['material'] ?? null,
        subcategory: mapSubcategory(d['type']),
        seasons,
        occasions,
        description: b.description ?? null,
        tags: b.tags ?? [],
        details: d,
        // tempRange: null (cuando lo añada en backend)
    };
}

import { Item } from './item.model';

export enum Occasion {
  CASUAL = 'CASUAL',
  FORMAL = 'FORMAL',
  WORK = 'WORK',
  SPORT = 'SPORT',
  PARTY = 'PARTY',
  OUTDOOR = 'OUTDOOR',
  STREETWEAR = 'STREETWEAR',
  TRAVEL = 'TRAVEL',
  BUSINESS = 'BUSINESS',
  ATHLEISURE = 'ATHLEISURE',
}

export type OutfitSlotId = 'top' | 'bottom' | 'outerwear' | 'shoes';
export type OutfitItemWithSlot = Item & { slotId: OutfitSlotId };

export interface RecommendationRequest {
  occasion: Occasion;
  limit: number;
}

export interface OutfitRecommendationRequestDto {
  occasion?: string | null;
  limit?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OutfitCandidateResponseDto {
  topId: number;
  bottomId: number;
  outerwearId?: number | null;
  shoesId?: number | null;
  score: number;
  reasons: string[];
}

export interface RecommendationDto {
  topId: number;
  bottomId: number;
  outerwearId: number;
  shoesId?: number;
  score: number;
  reasons: string[];
}

export interface OutfitSlots {
  topId: number;
  bottomId: number;
  outerwearId?: number | null;
  shoesId: number | null;
}

export interface CanvasTransform {
  slotId: OutfitSlotId;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface SaveOutfitRequest {
  topId: number;
  bottomId: number;
  outerwearId: number;
  shoesId: number | null;
  occasion: Occasion;
  transforms?: CanvasTransform[];
}

export interface SaveOutfitResponse extends SaveOutfitRequest {
  id: number;
  createdAt: string;
  transforms?: CanvasTransform[];
}
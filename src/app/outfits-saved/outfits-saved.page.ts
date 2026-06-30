import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { OutfitService } from '../service/outfit/outfit.service';
import { ItemService } from '../service/item/item.service';
import { Occasion, OutfitSlotId, SaveOutfitResponse } from '../model/outfit.model';
import { Item } from '../model/item.model';
import { OutfitCanvasPreviewComponent } from '../shared/outfit-canvas-preview/outfit-canvas-preview.component';
import { trash } from 'ionicons/icons';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type SlotItem = Item & { slotId: OutfitSlotId };

@Component({
  selector: 'app-outfits-saved',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OutfitCanvasPreviewComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonText,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon
  ],
  templateUrl: './outfits-saved.page.html',
  styleUrls: ['./outfits-saved.page.scss']
})
export class OutfitsSavedPage implements OnInit, OnDestroy {
  private outfitService = inject(OutfitService);
  private itemService = inject(ItemService);
  private destroy$ = new Subject<void>();

  outfits: SaveOutfitResponse[] = [];
  itemsMap = new Map<number, Item>();
  public trash = trash;

  /**
   * Precomputado para evitar funciones en template y evitar loops/stack overflow
   * key = outfitId, value = items con slotId para el preview
   */
  itemsByOutfitId = new Map<number, SlotItem[]>();

  isLoading = true;
  hasError = false;
  errorMessage = '';

  ngOnInit() {
    this.loadOutfits();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmDelete(outfitId: number, event: Event) {
    event.stopPropagation();
    const confirmed = window.confirm('¿Eliminar este outfit guardado?');
    if (!confirmed) {
      return;
    }
    this.deleteOutfit(outfitId);
  }

  private deleteOutfit(outfitId: number) {
    this.isLoading = true;
    this.hasError = false;

    this.outfitService.deleteOutfit(outfitId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadOutfits();
        },
        error: (err) => {
          console.error('[OutfitsSaved] Error deleting outfit:', err);
          this.hasError = true;
          this.errorMessage = 'Error al eliminar el outfit';
          this.isLoading = false;
        }
      });
  }

  private loadOutfits() {
    this.isLoading = true;
    this.hasError = false;

    this.outfitService.getAllOutfits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (outfits) => {
          this.outfits = outfits ?? [];
          this.loadItemsForOutfits(this.outfits);
        },
        error: (err) => {
          console.error('[OutfitsSaved] Error loading outfits:', err);
          this.hasError = true;
          this.errorMessage = 'Error al cargar los outfits guardados';
          this.isLoading = false;
        }
      });
  }

  private loadItemsForOutfits(outfits: SaveOutfitResponse[]) {
    const itemIds = new Set<number>();

    outfits.forEach(outfit => {
      itemIds.add(outfit.topId);
      itemIds.add(outfit.bottomId);
      itemIds.add(outfit.outerwearId);
      if (outfit.shoesId) itemIds.add(outfit.shoesId);
    });

    const totalItems = itemIds.size;

    // Edge case: no items
    if (totalItems === 0) {
      this.itemsByOutfitId.clear();
      this.isLoading = false;
      return;
    }

    let loadedCount = 0;

    itemIds.forEach(itemId => {
      this.itemService.getItem(itemId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (item) => {
            this.itemsMap.set(itemId, item);
            loadedCount++;
            if (loadedCount === totalItems) this.finishItemsLoad();
          },
          error: (err) => {
            console.error(`[OutfitsSaved] Error loading item ${itemId}:`, err);
            loadedCount++;
            if (loadedCount === totalItems) this.finishItemsLoad();
          }
        });
    });
  }

  private finishItemsLoad() {
    // Una vez cargados los items, construimos el map por outfit para el preview
    this.buildItemsByOutfitId(this.outfits);
    this.isLoading = false;
  }

  private buildItemsByOutfitId(outfits: SaveOutfitResponse[]) {
    this.itemsByOutfitId.clear();

    outfits.forEach(outfit => {
      const items: SlotItem[] = [];

      const topItem = this.itemsMap.get(outfit.topId);
      if (topItem) items.push({ ...topItem, slotId: 'top' });

      const bottomItem = this.itemsMap.get(outfit.bottomId);
      if (bottomItem) items.push({ ...bottomItem, slotId: 'bottom' });

      const outerwearItem = this.itemsMap.get(outfit.outerwearId);
      if (outerwearItem) items.push({ ...outerwearItem, slotId: 'outerwear' });

      if (outfit.shoesId) {
        const shoesItem = this.itemsMap.get(outfit.shoesId);
        if (shoesItem) items.push({ ...shoesItem, slotId: 'shoes' });
      }

      this.itemsByOutfitId.set(outfit.id, items);
    });
  }

  /**
   * Usa esto en el template:
   * [items]="getItemsForOutfitId(outfit.id)"
   */
  getItemsForOutfitId(outfitId: number): SlotItem[] {
    return this.itemsByOutfitId.get(outfitId) ?? [];
  }

  getItem(itemId: number): Item | undefined {
    return this.itemsMap.get(itemId);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  getOccasionLabel(occasion: Occasion | string): string {
    const labels: Record<string, string> = {
      CASUAL: 'Casual',
      FORMAL: 'Formal',
      WORK: 'Trabajo',
      SPORT: 'Deporte',
      PARTY: 'Fiesta',
      OUTDOOR: 'Exterior',
      STREETWEAR: 'Streetwear',
      TRAVEL: 'Viaje',
      BUSINESS: 'Negocios',
      ATHLEISURE: 'Athleisure'
    };

    return labels[String(occasion)] ?? String(occasion);
  }

  onOutfitClick(outfitId: number) {
    console.log('[OutfitsSaved] Outfit clicked:', outfitId);
  }

  getOutfitItems(outfit: SaveOutfitResponse): SlotItem[] {
    return this.itemsByOutfitId.get(outfit.id) ?? [];
  }
}

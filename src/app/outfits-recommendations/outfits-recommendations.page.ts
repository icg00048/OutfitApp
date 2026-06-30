import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSpinner,
    IonCard,
    IonCardContent,
    AlertController,
    LoadingController,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ItemService } from '../service/item/item.service';
import { OutfitService } from '../service/outfit/outfit.service';
import { OutfitRecommendationService } from '../service/outfit/outfit-recommendation.service';
import { Item } from '../model/item.model';
import { Occasion, OutfitCandidateResponseDto, OutfitSlots, SaveOutfitRequest, OutfitItemWithSlot } from '../model/outfit.model';
import { environment } from 'src/environments/environment';
import { OutfitItemsPanelComponent } from '../shared/outfit-items-panel/outfit-items-panel.component';
import { FreeCanvasComponent } from '../shared/free-canvas/free-canvas.component';
import { CanvasItem, CanvasItemTransform } from '../shared/free-canvas/free-canvas.model';
import { finalize, timeout } from 'rxjs';

@Component({
    selector: 'app-outfits-recommendations',
    standalone: true,   
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        IonHeader,
        IonToolbar,
        IonBackButton,
        IonButtons,
        IonTitle,
        IonContent,
        IonSelect,
        IonSelectOption,
        IonButton,
        IonIcon,
        IonSpinner,
        IonCard,
        IonCardContent,
        OutfitItemsPanelComponent,
        FreeCanvasComponent,
    ],
    templateUrl: './outfits-recommendations.page.html',
    styleUrls: ['./outfits-recommendations.page.scss'],
})
export class OutfitsRecommendationsPage implements OnInit {
  private itemService = inject(ItemService);
  private outfitService = inject(OutfitService);
  private recommendationService = inject(OutfitRecommendationService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  readonly Occasion = Occasion;
  occasions = Object.values(Occasion);

  selectedOccasion: Occasion = Occasion.CASUAL;
  recommendations: OutfitCandidateResponseDto[] = [];
  currentIndex = 0;
  itemsById: Map<number, Item> = new Map();
  editableOutfit: OutfitSlots | null = null;
  canvasItems: CanvasItem[] = [];
  canvasTransforms: Map<string | number, CanvasItemTransform> = new Map();

  isLoading = true;
  isProcessing = false;
  error: string | null = null;
  reasonsExpanded = false;

  get currentOutfit(): OutfitSlots | null {
    if (this.recommendations.length === 0) return null;
    const rec = this.recommendations[this.currentIndex];
    return {
      topId: rec.topId,
      bottomId: rec.bottomId,
      outerwearId: rec.outerwearId,
      shoesId: rec.shoesId || null,
    };
  }

  get currentRecommendation(): OutfitCandidateResponseDto | null {
    return this.recommendations.length > 0 ? this.recommendations[this.currentIndex] : null;
  }

    get outfitItems(): OutfitItemWithSlot[] {
        if (!this.editableOutfit) return [];

        const items: OutfitItemWithSlot[] = [];

        const top = this.itemsById.get(this.editableOutfit.topId);
        if (top) items.push({ ...top, slotId: 'top' });

        const bottom = this.itemsById.get(this.editableOutfit.bottomId);
        if (bottom) items.push({ ...bottom, slotId: 'bottom' });

        const outerwearId = this.editableOutfit.outerwearId;
        if (outerwearId != null) {
          const outer = this.itemsById.get(outerwearId);
          if (outer) items.push({ ...outer, slotId: 'outerwear' });
        }

        const shoesId = this.editableOutfit.shoesId;
        if (shoesId) {
            const shoes = this.itemsById.get(shoesId);
            if (shoes) items.push({ ...shoes, slotId: 'shoes' });
        }

        return items;
    }


  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    this.error = null;
    console.log('[Outfits] loadInitialData start', environment.apiBaseUrl);

    // Load all items first
    this.itemService.getItems().subscribe({
      next: (items) => {
        console.log('[Outfits] items OK', items.length);
        items.forEach((item) => {
          this.itemsById.set(item.id, item);
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.error = `Error loading items: ${this.formatHttpError(err)}`;
        this.isLoading = false;
      },
    });
  }

  generateRecommendations() {
    console.log('[Outfits] generateRecommendations start', {
      api: environment.apiBaseUrl,
      occasion: this.selectedOccasion
    });

    this.isProcessing = true;
    this.error = null;

    this.recommendationService.getRecommendations({
      occasion: this.selectedOccasion,
      limit: 5,
    })
    .pipe(
      timeout(20000),
      finalize(() => {
        this.isProcessing = false;
      })
    )
    .subscribe({
      next: (recommendations) => {
        console.log('[Outfits] recommendations OK', recommendations);

        this.recommendations = recommendations;
        this.currentIndex = 0;
        this.syncEditableOutfitFromCurrentRecommendation();
        this.syncCanvasItemsFromEditableOutfit();
        this.reasonsExpanded = false;
      },
      error: (err) => {
        console.error('[Outfits] recommendations ERROR', err);
        this.error = `Error generating recommendations: ${this.formatHttpError(err)}`;
      },
    });
  }

  shuffleOutfit() {
    if (this.recommendations.length === 0) {
      this.showEmptyState();
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.recommendations.length;
    this.syncEditableOutfitFromCurrentRecommendation();
    this.syncCanvasItemsFromEditableOutfit();
    this.reasonsExpanded = false;
  }

  toggleReasons() {
    this.reasonsExpanded = !this.reasonsExpanded;
  }

  removeShoe() {
    if (this.editableOutfit) {
      this.editableOutfit = { ...this.editableOutfit, shoesId: null };
      this.syncCanvasItemsFromEditableOutfit();
    }
  }

  async saveOutfit() {
    if (!this.editableOutfit) return;

    const loading = await this.loadingCtrl.create({
      message: 'Guardando outfit...',
    });
    await loading.present();

    const outerwearId = this.editableOutfit.outerwearId;
    if (outerwearId == null) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se puede guardar un outfit sin prenda superior externa.',
        buttons: [{ text: 'OK', role: 'cancel' }],
      });
      await alert.present();
      return;
    }

    const transformsArray = Array.from(this.canvasTransforms.values()).map(t => ({
      slotId: String(t.id) as any,
      x: t.x,
      y: t.y,
      scale: t.scale,
      zIndex: t.zIndex,
    }));

    const saveRequest: SaveOutfitRequest = {
      topId: this.editableOutfit.topId,
      bottomId: this.editableOutfit.bottomId,
      outerwearId,
      shoesId: this.editableOutfit.shoesId,
      occasion: this.selectedOccasion,
      transforms: transformsArray,
    };

    this.outfitService.saveOutfit(saveRequest).subscribe({
      next: async () => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: '¡Outfit guardado!',
          message: 'El outfit se ha guardado correctamente.',
          buttons: [{ text: 'OK', role: 'cancel' }],
        });
        await alert.present();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error saving outfit:', err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo guardar el outfit. Intenta de nuevo.',
          buttons: [{ text: 'OK', role: 'cancel' }],
        });
        await alert.present();
      },
    });
  }

  getImageUrl(item: Item): string {
    if (!item.imageUrl) return 'assets/placeholder.png';
    if (item.imageUrl.startsWith('http')) return item.imageUrl;
    const apiBase = environment.apiBaseUrl ?? 'http://localhost:8080';
    return `${apiBase}${item.imageUrl}`;
  }

  getItemFromSlot(slot: 'top' | 'bottom' | 'outerwear' | 'shoes'): Item | null {
    if (!this.editableOutfit) return null;

    let itemId: number | null = null;
    switch (slot) {
      case 'top':
        itemId = this.editableOutfit.topId;
        break;
      case 'bottom':
        itemId = this.editableOutfit.bottomId;
        break;
      case 'outerwear':
        itemId = this.editableOutfit.outerwearId ?? null;
        break;
      case 'shoes':
        itemId = this.editableOutfit.shoesId;
        break;
    }

    return itemId ? this.itemsById.get(itemId) ?? null : null;
  }

  private syncEditableOutfitFromCurrentRecommendation(): void {
    if (!this.currentRecommendation) {
      this.editableOutfit = null;
      return;
    }
    const rec = this.currentRecommendation;
    this.editableOutfit = {
      topId: rec.topId,
      bottomId: rec.bottomId,
      outerwearId: rec.outerwearId,
      shoesId: rec.shoesId ?? null,
    };
  }

  private async showEmptyState() {
    const alert = await this.alertCtrl.create({
      header: 'Sin recomendaciones',
      message: 'No hay recomendaciones disponibles. Intenta generar nuevas.',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await alert.present();
  }

  private syncCanvasItemsFromEditableOutfit() {
    if (!this.editableOutfit) {
      this.canvasItems = [];
      return;
    }

    const newCanvasItems: CanvasItem[] = [];
    const slotConfig: Array<{ slot: keyof OutfitSlots; zIndex: number; slotName: string }> = [
      { slot: 'outerwearId', zIndex: 1, slotName: 'outerwear' },
      { slot: 'topId', zIndex: 2, slotName: 'top' },
      { slot: 'bottomId', zIndex: 3, slotName: 'bottom' },
      { slot: 'shoesId', zIndex: 4, slotName: 'shoes' },
    ];

    slotConfig.forEach(({ slot, zIndex, slotName }) => {
      const itemId = this.editableOutfit![slot];
      if (!itemId) return;

      const item = this.itemsById.get(itemId);
      if (!item) return;

      const imageUrl = this.getImageUrl(item);

      // Check if we have stored transform for this item, otherwise use defaults
      const existingTransform = this.canvasTransforms.get(slotName);
      const x = existingTransform?.x ?? 50 + (zIndex - 1) * 20;
      const y = existingTransform?.y ?? 100 + (zIndex - 1) * 10;
      const scale = existingTransform?.scale ?? 1;

      const canvasItem: CanvasItem = {
        id: slotName,
        imageUrl,
        x,
        y,
        scale,
        zIndex,
      };

      newCanvasItems.push(canvasItem);
    });

    this.canvasItems = newCanvasItems;
  }

  onCanvasTransformed(transforms: CanvasItemTransform[]) {
    this.canvasTransforms.clear();
    transforms.forEach((transform) => {
      this.canvasTransforms.set(transform.id, transform);
    });
  }

  private formatHttpError(err: any): string {
    const status = err?.status;
    const statusText = err?.statusText;
    const message = err?.message;
    const url = err?.url;

    let body = '';
    try { body = JSON.stringify(err?.error); } catch {}

    return `status=${status} ${statusText ?? ''} url=${url ?? ''} message=${message ?? ''} body=${body}`;
  }

}

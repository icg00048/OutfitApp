import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutfitSlotId } from '../../model/outfit.model';
import { Item } from '../../model/item.model';
import { environment } from 'src/environments/environment';

type SlotItem = Item & { slotId: OutfitSlotId };

interface CanvasItem {
  id: number;
  imageUrl: string | null;
  slotId: OutfitSlotId;
  x: number;      // en %
  y: number;      // en %
  scale: number;
  zIndex: number;
}

@Component({
  selector: 'app-outfit-canvas-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './outfit-canvas-preview.component.html',
  styleUrls: ['./outfit-canvas-preview.component.scss']
})
export class OutfitCanvasPreviewComponent implements OnChanges {
  @Input() items: SlotItem[] = [];
  @Input() transforms: Array<{ slotId: OutfitSlotId; x: number; y: number; scale: number; zIndex: number }> = [];

  canvasItems: CanvasItem[] = [];
  stageStyle: Record<string, any> = {};

  private readonly ITEM_SIZE = 80; // px
  private readonly apiBase = environment.apiBaseUrl;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['transforms']) {
      this.buildCanvasItems();
      this.computeAutoFit();
    }
  }

  private buildCanvasItems(): void {
    if (!this.items?.length) {
      this.canvasItems = [];
      this.stageStyle = {};
      return;
    }

    const defaultPositions: Record<OutfitSlotId, { x: number; y: number; scale: number; zIndex: number }> = {
      outerwear: { x: 50, y: 30, scale: 1, zIndex: 10 },
      top:       { x: 50, y: 40, scale: 1, zIndex: 20 },
      bottom:    { x: 50, y: 65, scale: 1, zIndex: 15 },
      shoes:     { x: 50, y: 90, scale: 1, zIndex: 5 },
    };

    this.canvasItems = this.items
      .map((item) => {
        const slotId = item.slotId;
        const t = this.transforms?.find(x => x.slotId === slotId);
        const p = defaultPositions[slotId];

        return {
          id: item.id,
          imageUrl: this.toAbsoluteUrl(item.imageUrl ?? null),
          slotId,
          x: t?.x ?? p.x,
          y: t?.y ?? p.y,
          scale: t?.scale ?? p.scale,
          zIndex: t?.zIndex ?? p.zIndex,
        };
      })
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  private computeAutoFit(): void {
    if (!this.canvasItems.length) {
      this.stageStyle = {};
      return;
    }

    const APPROX_PX_TO_PERCENT = 0.12; // ajustable

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const it of this.canvasItems) {
      const half = (this.ITEM_SIZE * (it.scale ?? 1) * APPROX_PX_TO_PERCENT) / 2;
      minX = Math.min(minX, it.x - half);
      maxX = Math.max(maxX, it.x + half);
      minY = Math.min(minY, it.y - half);
      maxY = Math.max(maxY, it.y + half);
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);

    const padding = 10; // %
    const available = 100 - padding * 2;
    const fitScale = Math.min(available / bw, available / bh);

    const tx = 50 - cx;
    const ty = 50 - cy;

    this.stageStyle = {
      transform: `translate(${tx}%, ${ty}%) scale(${fitScale})`,
    };
  }

  getItemStyle(canvasItem: CanvasItem) {
    return {
      left: `${canvasItem.x}%`,
      top: `${canvasItem.y}%`,
      transform: `translate(-50%, -50%) scale(${canvasItem.scale})`,
      zIndex: canvasItem.zIndex,
      width: `${this.ITEM_SIZE}px`,
      height: `${this.ITEM_SIZE}px`,
      pointerEvents: 'none',
    };
  }

  private toAbsoluteUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    if (url.startsWith('/')) return `${this.apiBase}${url}`;
    return `${this.apiBase}/${url}`;
  }

  getSlotLabel(slotId: OutfitSlotId): string {
    const labels: Record<OutfitSlotId, string> = {
      top: 'Top',
      bottom: 'Bottom',
      outerwear: 'Outerwear',
      shoes: 'Shoes'
    };
    return labels[slotId];
  }
}

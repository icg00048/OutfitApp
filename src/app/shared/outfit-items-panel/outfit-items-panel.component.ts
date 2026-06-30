import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonButton, IonIcon, IonThumbnail } from '@ionic/angular/standalone';
import { Item } from '../../model/item.model';
import { environment } from 'src/environments/environment';

interface OutfitItemWithSlot extends Item {
  slotId: 'top' | 'bottom' | 'outerwear' | 'shoes';
}

@Component({
  selector: 'app-outfit-items-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, IonButton, IonIcon, IonThumbnail],
  templateUrl: './outfit-items-panel.component.html',
  styleUrls: ['./outfit-items-panel.component.scss'],
})
export class OutfitItemsPanelComponent {
  @Input() items: OutfitItemWithSlot[] = [];
  @Output() removeShoe = new EventEmitter<void>();
  @Output() saveOutfit = new EventEmitter<void>();

  onRemoveShoe(event: Event) {
    event.stopPropagation();
    this.removeShoe.emit();
  }

  onSaveOutfit() {
    this.saveOutfit.emit();
  }

  getImageUrl(item: Item): string {
    if (!item.imageUrl) return 'assets/placeholder.png';
    if (item.imageUrl.startsWith('http')) return item.imageUrl;
    const apiBase = environment.apiBaseUrl ?? 'http://localhost:8080';
    return `${apiBase}${item.imageUrl}`;
  }
}

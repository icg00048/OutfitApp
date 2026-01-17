import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Item } from '../../model/item.model';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss'],
})
export class ItemCardComponent {
  @Input() item!: Item;

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/placeholder.png';
  }
}

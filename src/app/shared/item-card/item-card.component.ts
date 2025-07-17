import { CommonModule } from '@angular/common';
import { Component, Input} from '@angular/core';
import { IonCard, IonImg } from '@ionic/angular/standalone';
import { Item } from '../../model/item.model';

@Component({
  selector: 'app-item-card',
  imports: [
    CommonModule,
    IonCard,
    IonImg
  ],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss'],
})

export class ItemCardComponent {
  @Input() item!: Item;
}

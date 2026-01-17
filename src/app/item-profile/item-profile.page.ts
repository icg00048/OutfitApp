import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonBackButton, IonButtons, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Item } from '../model/item.model';
import { ItemService } from '../service/item/item.service';

@Component({
  selector: 'app-item-profile',
  templateUrl: './item-profile.page.html',
  styleUrls: ['./item-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonContent,
  ],
})
export class ItemProfilePage implements OnInit {
    private route = inject(ActivatedRoute);
    private itemService = inject(ItemService);

    item: Item | null = null;
    isLoading = true;
    error: string | null = null;

    ngOnInit() {
        this.loadItem();
    }

    private loadItem() {
        const itemIdParam = this.route.snapshot.paramMap.get('id');

        if (!itemIdParam) {
            this.error = 'Item ID not found';
            this.isLoading = false;
            return;
        }

        const itemId = Number(itemIdParam);

        if (Number.isNaN(itemId)) {
            this.error = 'Invalid item ID';
            this.isLoading = false;
            return;
        }

        this.itemService.getItems().subscribe({
            next: (items) => {
            this.item = items.find(i => i.id === itemId) ?? null;

            if (!this.item) {
                this.error = 'Item not found';
            }

            this.isLoading = false;
            },
            error: (err) => {
            console.error('Error loading item:', err);
            this.error = 'Error loading item details';
            this.isLoading = false;
            }
        });
    }


    onImgError(ev: Event) {
        (ev.target as HTMLImageElement).src = 'assets/placeholder.png';
    }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonBackButton, IonButtons, IonTitle, IonContent, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Item } from '../model/item.model';
import { ItemService } from '../service/item/item.service';
import { trash, pencil } from 'ionicons/icons';

@Component({
  selector: 'app-item-profile',
  templateUrl: './item-profile.page.html',
  styleUrls: ['./item-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
  ],
})
export class ItemProfilePage implements OnInit {
    private route = inject(ActivatedRoute);
    private itemService = inject(ItemService);

    item: Item | null = null;
    isLoading = true;
    error: string | null = null;
    public trash = trash;
    public pencil = pencil;

    editing = false;
    isSaving = false;
    saveError: string | null = null;
    categories: string[] = [];
    colors: string[] = [];

    editForm = {
        name: '',
        category: '' as string,
        color: '',
        secondaryColor: '' as string | null,
        description: '',
        tags: ''
    };

    ngOnInit() {
        this.loadItem();
        this.loadCategories();
        this.loadColors();
    }

    private loadCategories() {
        this.itemService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (err) => {
                console.error('[ItemProfile] Error loading categories:', err);
                this.categories = [];
            }
        });
    }

    private loadColors(): void {
        this.itemService.getColors().subscribe({
            next: (colors) => {
                console.log('[ItemProfile] Colors loaded:', colors);
                this.colors = colors;
            },
            error: (err) => {
                console.error('[ItemProfile] Error loading colors:', err);
                this.colors = [];
            }
        });
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

        this.itemService.getItem(itemId).subscribe({
            next: (item) => {
                this.item = item;
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

    startEdit() {
        if (!this.item) return;

        this.editForm = {
            name: this.item.nickname,
            category: this.item.category?.toString().toUpperCase() ?? '',
            color: this.item.primaryColor,
            secondaryColor: this.item.secondaryColor ? String(this.item.secondaryColor).toUpperCase() : null,
            description: this.item.description ?? '',
            tags: (this.item.tags ?? []).join(', ')
        };
        this.saveError = null;
        this.editing = true;
    }

    cancelEdit() {
        this.editing = false;
        this.saveError = null;
    }

    saveChanges() {
        if (!this.item) return;

        this.isSaving = true;
        this.saveError = null;

        const payload = {
            name: this.editForm.name,
            category: this.editForm.category?.toString().toUpperCase(),
            color: this.editForm.color,
            description: this.editForm.description || null,
            tags: this.editForm.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean)
        };

        // Merge secondary color into details to avoid clobbering other detail fields
        const existingDetails = this.item?.details ?? {};
        const detailsUpdate = { ...existingDetails, secondary_color: this.editForm.secondaryColor ?? null };
        (payload as any).details = detailsUpdate;

        this.itemService.updateItem(this.item.id, payload).subscribe({
            next: (updated) => {
                this.item = updated;
                this.editing = false;
                this.isSaving = false;
            },
            error: (err) => {
                console.error('[ItemProfile] Error updating item:', err);
                this.saveError = 'Error al actualizar la prenda';
                this.isSaving = false;
            }
        });
    }

    confirmDelete(itemId: number, event: Event) {
        event.stopPropagation();
        const confirmed = window.confirm('¿Eliminar esta prenda?');
        if (!confirmed) return;

        this.deleteItem(itemId);
    }

    private deleteItem(itemId: number) {
        this.isLoading = true;
        this.error = null;

        this.itemService.deleteItem(itemId).subscribe({
            next: () => {
                window.history.back();
            },
            error: (err) => {
                console.error('[ItemProfile] Error deleting item:', err);
                this.error = 'Error al eliminar la prenda';
                this.isLoading = false;
            }
        });
    }

    getColorLabel(color: string | null | undefined): string {
        if (!color) return '';

        const colorLabels: Record<string, string> = {
            BLACK: 'Black',
            WHITE: 'White',
            GRAY: 'Gray',
            GREY: 'Grey',
            RED: 'Red',
            BLUE: 'Blue',
            GREEN: 'Green',
            YELLOW: 'Yellow',
            ORANGE: 'Orange',
            PURPLE: 'Purple',
            PINK: 'Pink',
            BROWN: 'Brown',
            BEIGE: 'Beige',
            NAVY: 'Navy',
            MULTICOLOR: 'Multicolor'
        };

        const normalizedColor = color.trim().toUpperCase();

        return colorLabels[normalizedColor] ?? color;
        }

        getColorHex(color: string | null | undefined): string {
        if (!color) return 'transparent';

        const colorHexMap: Record<string, string> = {
            BLACK: '#111111',
            WHITE: '#ffffff',
            GRAY: '#808080',
            GREY: '#808080',
            RED: '#d32f2f',
            BLUE: '#1976d2',
            GREEN: '#388e3c',
            YELLOW: '#fbc02d',
            ORANGE: '#f57c00',
            PURPLE: '#7b1fa2',
            PINK: '#c2185b',
            BROWN: '#795548',
            BEIGE: '#d7b98e',
            NAVY: '#0d1b3d',
            MULTICOLOR: 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)'
        };

        const normalizedColor = color.trim().toUpperCase();

        return colorHexMap[normalizedColor] ?? '#cccccc';
    }
}

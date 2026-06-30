import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestureController, Gesture } from '@ionic/angular/standalone';
import { CanvasItem, CanvasItemState, CanvasItemTransform } from './free-canvas.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-free-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './free-canvas.component.html',
  styleUrls: ['./free-canvas.component.scss'],
})
export class FreeCanvasComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() items: CanvasItem[] = [];
  @Input() canvasHeight: string = '500px';
  @Output() itemsTransformed = new EventEmitter<CanvasItemTransform[]>();

  @ViewChild('canvas', { read: ElementRef }) canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('itemEl', { read: ElementRef }) itemEls!: QueryList<ElementRef<HTMLElement>>;

  itemStates: Map<string | number, CanvasItemState> = new Map();

  // Keyed gestures to avoid collisions
  private gestures: Map<string, Gesture> = new Map();
  private draggingItemId: string | number | null = null;
  private lastX = 0;
  private lastY = 0;
  private pinchScale = 1;
  private maxZIndex = 100;

  private viewReady = false;

  constructor(
    private gestureCtrl: GestureController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  // -----------------------------
  // Lifecycle
  // -----------------------------

  ngOnInit() {
    this.initializeItemStates();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      // Re-init always (also on first change)
      this.initializeItemStates();

      // If view is ready, wait a tick for ngFor to render, then refresh gestures
      if (this.viewReady) {
        queueMicrotask(() => this.refreshGestures());
      }
    }
  }

  ngAfterViewInit() {
    this.viewReady = true;

    // Anytime ngFor re-renders, rebuild gestures
    this.itemEls.changes.subscribe(() => {
      this.refreshGestures();
    });

    // Initial setup
    this.refreshGestures();
  }

  ngOnDestroy() {
    this.cleanupGestures();
  }

  // -----------------------------
  // Template helpers
  // -----------------------------

  trackByItemId = (_: number, item: CanvasItem) => item.id;

  getItemState(itemId: string | number): CanvasItemState | undefined {
    return this.itemStates.get(itemId);
  }

  getItemTransform(state: CanvasItemState): string {
    return `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
  }

  getItemTransformSafe(itemId: string | number): string {
    const state = this.itemStates.get(itemId);
    return state ? this.getItemTransform(state) : 'translate(0px, 0px) scale(1)';
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (img) img.src = 'assets/placeholder.png';
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'assets/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const base = environment.apiBaseUrl ?? '';
    return `${base}${imageUrl}`;
  }

  // -----------------------------
  // State init
  // -----------------------------

  private initializeItemStates() {
    this.itemStates.clear();

    if (!Array.isArray(this.items) || this.items.length === 0) return;

    this.items.forEach((item, index) => {
      this.itemStates.set(item.id, {
        id: item.id,
        imageUrl: item.imageUrl,
        x: item.x ?? 50 + index * 20,
        y: item.y ?? 50 + index * 20,
        scale: item.scale ?? 1,
        zIndex: item.zIndex ?? index + 1,
      });
    });

    this.maxZIndex = Math.max(
      100,
      ...Array.from(this.itemStates.values()).map((s) => s.zIndex)
    );
  }

  private bringToFront(itemId: string | number) {
    const state = this.itemStates.get(itemId);
    if (!state) return;
    this.maxZIndex += 1;
    state.zIndex = this.maxZIndex;
  }

  private emitChanges() {
    const transforms: CanvasItemTransform[] = Array.from(this.itemStates.values()).map((s) => ({
      id: s.id,
      x: Math.round(s.x),
      y: Math.round(s.y),
      scale: Math.round(s.scale * 100) / 100,
      zIndex: s.zIndex,
    }));

    this.itemsTransformed.emit(transforms);
  }

  // -----------------------------
  // Gestures
  // -----------------------------

  private refreshGestures() {
    console.log('[FreeCanvas] gestures disabled test');
    return;
  }

  private setupGesturesFromRenderedElements() {
    const els = this.itemEls?.toArray() ?? [];
    if (!els.length) return;

    for (const elRef of els) {
      const el = elRef.nativeElement;
      const idAttr = el.getAttribute('data-item-id');
      if (!idAttr) continue;

      const itemId = this.parseId(idAttr);
      this.setupItemGestures(el, itemId);
    }
  }

  private parseId(raw: string): string | number {
    // Keeps "top"/"bottom" as string. Converts "12" -> 12.
    const asNum = Number(raw);
    return Number.isFinite(asNum) && String(asNum) === raw ? asNum : raw;
  }

  private setupItemGestures(element: HTMLElement, itemId: string | number) {
    const panKey = `pan:${String(itemId)}`;
    const pinchKey = `pinch:${String(itemId)}`;

    // PAN
    const panGesture = this.gestureCtrl.create({
      el: element,
      gestureName: `pan-item-${String(itemId)}`,
      threshold: 0,
      disableScroll: true,
      gesturePriority: 100,
      onStart: () => {
        this.draggingItemId = itemId;
        this.lastX = 0;
        this.lastY = 0;
        this.bringToFront(itemId);
      },
      onMove: (detail) => {
        if (this.draggingItemId !== itemId) return;

        const deltaX = detail.deltaX - this.lastX;
        const deltaY = detail.deltaY - this.lastY;

        this.lastX = detail.deltaX;
        this.lastY = detail.deltaY;

        const state = this.itemStates.get(itemId);
        if (state) {
          state.x += deltaX;
          state.y += deltaY;
        }
      },
      onEnd: () => {
        this.draggingItemId = null;
        // emit inside Angular for reliable parent updates
        this.ngZone.run(() => this.emitChanges());
      },
    });

    panGesture.enable(true);
    this.gestures.set(panKey, panGesture);

    // PINCH
    const pinchGesture = this.gestureCtrl.create({
      el: element,
      gestureName: `pinch-item-${String(itemId)}`,
      threshold: 0,
      disableScroll: true,
      gesturePriority: 101,
      onStart: () => {
        this.pinchScale = 1;
        this.bringToFront(itemId);
      },
      onMove: (detail: any) => {
        if (!detail?.scale) return;

        const state = this.itemStates.get(itemId);
        if (state) {
          const scaleDelta = detail.scale - this.pinchScale;
          state.scale = Math.max(0.5, Math.min(3, state.scale + scaleDelta * 0.5));
          this.pinchScale = detail.scale;
        }
      },
      onEnd: () => {
        this.pinchScale = 1;
        this.ngZone.run(() => this.emitChanges());
      },
    });

    pinchGesture.enable(true);
    this.gestures.set(pinchKey, pinchGesture);
  }

  private cleanupGestures() {
    if (!this.gestures.size) return;

    this.gestures.forEach((g) => {
      try {
        g.destroy();
      } catch {}
    });
    this.gestures.clear();
  }

  resetItemPositions() {
    this.maxZIndex = this.items.length;
    this.initializeItemStates();
    this.refreshGestures();
  }
}

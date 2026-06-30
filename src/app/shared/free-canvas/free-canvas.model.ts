export interface CanvasItem {
  id: string | number;
  imageUrl: string;
  x?: number;
  y?: number;
  scale?: number;
  zIndex?: number;
}

export interface CanvasItemState extends CanvasItem {
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface CanvasItemTransform {
  id: string | number;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface TabletPart {
  id: string;
  tabletId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  originalWidth: number;
  originalHeight: number;
}

export interface Tablet {
  id: string;
  color: string;
  parts: TabletPart[];
  originalWidth: number;
  originalHeight: number;
}

export interface SplitLine {
  x?: number;
  y?: number;
  type: 'horizontal' | 'vertical';
}

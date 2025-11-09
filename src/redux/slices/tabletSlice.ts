import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TabletPart, Tablet, SplitLine } from '../../types/tablet';

interface TabletState {
  tablets: Tablet[];
  isDrawing: boolean;
  currentTablet: Omit<Tablet, 'id' | 'parts'> | null;
  splitLine: SplitLine | null;
}

// ====================== We are using Omit here because, ======================

// When user starts drawing, we don't have an id yet (it gets assigned when drawing finishes)
// We don't have parts yet (a new tablet starts with one part that covers the whole tablet)
// We only track the basic properties needed for drawing: color, originalWidth, originalHeight
// So currentTablet represents a tablet that's being drawn but not yet completed.

const initialState: TabletState = {
  tablets: [],
  isDrawing: false,
  currentTablet: null,
  splitLine: null,
};

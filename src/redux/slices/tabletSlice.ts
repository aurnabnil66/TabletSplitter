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

const tabletSlice = createSlice({
  name: 'tablets',
  initialState,
  reducers: {
    startDrawing: (
      state,
      action: PayloadAction<{ x: number; y: number; color: string }>,
    ) => {
      state.isDrawing = true;
      state.currentTablet = {
        color: action.payload.color,
        originalWidth: 0,
        originalHeight: 0,
      };
    },
    updateDrawing: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
        width: number;
        height: number;
      }>,
    ) => {
      if (state.currentTablet) {
        state.currentTablet.originalWidth = action.payload.width;
        state.currentTablet.originalHeight = action.payload.height;
      }
    },
    finishDrawing: state => {
      if (
        state.currentTablet &&
        state.currentTablet.originalWidth >= 40 &&
        state.currentTablet.originalHeight >= 20
      ) {
        const newTablet: Tablet = {
          id: Date.now().toString(), // tablet id according to current date
          color: state.currentTablet.color,
          originalWidth: state.currentTablet.originalWidth,
          originalHeight: state.currentTablet.originalHeight,
          parts: [
            {
              id: `${Date.now()}-part-0`,
              tabletId: Date.now().toString(),
              x: 0,
              y: 0,
              width: state.currentTablet.originalWidth,
              height: state.currentTablet.originalHeight,
              color: state.currentTablet.color,
              originalWidth: state.currentTablet.originalWidth,
              originalHeight: state.currentTablet.originalHeight,
            },
          ],
        };
        state.tablets.push(newTablet); // add new tablet
      }
      state.isDrawing = false;
      state.currentTablet = null;
    },
    moveTabletPart: (
      state,
      action: PayloadAction<{
        tabletId: string;
        partId: string;
        x: number;
        y: number;
      }>,
    ) => {
      const { tabletId, partId, x, y } = action.payload;
      const tablet = state.tablets.find(t => t.id === tabletId);
      if (tablet) {
        const part = tablet.parts.find(p => p.id === partId);
        if (part) {
          part.x = x;
          part.y = y;
        }
      }
    },
    setSplitLine: (state, action: PayloadAction<SplitLine | null>) => {
      state.splitLine = action.payload;
    },
    splitTablets: (state, action: PayloadAction<SplitLine>) => {
      const splitLine = action.payload;
      const newTablets: Tablet[] = [];

      state.tablets.forEach(tablet => {
        const newParts: TabletPart[] = [];

        tablet.parts.forEach(part => {
          if (splitLine.type === 'vertical' && splitLine.x !== undefined) {
            // Vertical split
            if (part.x < splitLine.x && part.x + part.width > splitLine.x) {
              // Split the part
              const leftWidth = splitLine.x - part.x;
              const rightWidth = part.width - leftWidth;

              if (leftWidth >= 20 && rightWidth >= 20) {
                // Create left part
                newParts.push({
                  ...part,
                  id: `${part.id}-left`,
                  width: leftWidth,
                });
                // Create right part
                newParts.push({
                  ...part,
                  id: `${part.id}-right`,
                  x: splitLine.x,
                  width: rightWidth,
                });
              } else {
                // Move to appropriate side based on which part is larger
                if (leftWidth >= rightWidth) {
                  newParts.push({
                    ...part,
                    width: leftWidth,
                  });
                } else {
                  newParts.push({
                    ...part,
                    x: splitLine.x,
                    width: rightWidth,
                  });
                }
              }
            } else {
              newParts.push(part);
            }
          } else if (
            splitLine.type === 'horizontal' &&
            splitLine.y !== undefined
          ) {
            // Horizontal split
            if (part.y < splitLine.y && part.y + part.height > splitLine.y) {
              const topHeight = splitLine.y - part.y;
              const bottomHeight = part.height - topHeight;

              if (topHeight >= 10 && bottomHeight >= 10) {
                // Create top part
                newParts.push({
                  ...part,
                  id: `${part.id}-top`,
                  height: topHeight,
                });
                // Create bottom part
                newParts.push({
                  ...part,
                  id: `${part.id}-bottom`,
                  y: splitLine.y,
                  height: bottomHeight,
                });
              } else {
                // Move to appropriate side
                if (topHeight >= bottomHeight) {
                  newParts.push({
                    ...part,
                    height: topHeight,
                  });
                } else {
                  newParts.push({
                    ...part,
                    y: splitLine.y,
                    height: bottomHeight,
                  });
                }
              }
            } else {
              newParts.push(part);
            }
          } else {
            newParts.push(part);
          }
        });

        if (newParts.length > 0) {
          newTablets.push({
            ...tablet,
            parts: newParts,
          });
        }
      });

      state.tablets = newTablets;
      state.splitLine = null;
    },
  },
});

export const {
  startDrawing,
  updateDrawing,
  finishDrawing,
  moveTabletPart,
  setSplitLine,
  splitTablets,
} = tabletSlice.actions;

export const tabletReducer = tabletSlice.reducer;

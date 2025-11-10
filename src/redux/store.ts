import { configureStore } from '@reduxjs/toolkit';
import { tabletReducer } from './slices/tabletSlice';

export const store = configureStore({
  reducer: {
    tablets: tabletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

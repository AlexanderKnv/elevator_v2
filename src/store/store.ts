import { configureStore } from '@reduxjs/toolkit';
import etageReducer from './etageSlice';

export const store = configureStore({
  reducer: {
    etage: etageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

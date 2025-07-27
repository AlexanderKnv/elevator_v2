import { configureStore } from '@reduxjs/toolkit';
import etageReducer from './etageSlice';
import kabineReducer from './kabineSlice';
export const store = configureStore({
    reducer: {
        etage: etageReducer,
        kabine: kabineReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import etageReducer from './etageSlice';
import kabineReducer from './kabineSlice';
import ruftasteReducer from './ruftasteSlice';

export const store = configureStore({
    reducer: {
        etage: etageReducer,
        kabine: kabineReducer,
        ruftaste: ruftasteReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import etageReducer from './etageSlice';
import kabineReducer from './kabineSlice';
import ruftasteReducer from './ruftasteSlice';
import schachtReducer from './schachtSlice';

export const store = configureStore({
    reducer: {
        etage: etageReducer,
        kabine: kabineReducer,
        ruftaste: ruftasteReducer,
        schacht: schachtReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

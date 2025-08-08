import { configureStore } from '@reduxjs/toolkit';
import etageReducer from './etageSlice';
import kabineReducer from './kabineSlice';
import ruftasteReducer from './ruftasteSlice';
import schachtReducer from './schachtSlice';
import anzeigeReducer from './anzeigeSlice ';

export const store = configureStore({
    reducer: {
        etage: etageReducer,
        kabine: kabineReducer,
        ruftaste: ruftasteReducer,
        schacht: schachtReducer,
        anzeige: anzeigeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

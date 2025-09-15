import { configureStore } from '@reduxjs/toolkit';
import etageReducer from './etageSlice';
import kabineReducer from './kabineSlice';
import ruftasteReducer from './ruftasteSlice';
import schachtReducer from './schachtSlice';
import anzeigeReducer from './anzeigeSlice ';
import globalsReducer from './globalsSlice';

export const store = configureStore({
    reducer: {
        etage: etageReducer,
        kabine: kabineReducer,
        ruftaste: ruftasteReducer,
        schacht: schachtReducer,
        anzeige: anzeigeReducer,
        globals: globalsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// src/store/schachtSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SchachtState {
    etagenMitSchacht: number[];
}

const initialState: SchachtState = {
    etagenMitSchacht: [],
};

const schachtSlice = createSlice({
    name: 'schacht',
    initialState,
    reducers: {
        addSchachtToEtage: (state, action: PayloadAction<number>) => {
            const etage = action.payload;
            if (!state.etagenMitSchacht.includes(etage)) {
                state.etagenMitSchacht.push(etage);
            }
        },
        removeSchachtFromEtage: (state, action: PayloadAction<number>) => {
            state.etagenMitSchacht = state.etagenMitSchacht.filter(n => n !== action.payload);
        },
        resetSchacht: (state) => {
            state.etagenMitSchacht = [];
        },
    },
});

export const { addSchachtToEtage, removeSchachtFromEtage, resetSchacht } = schachtSlice.actions;
export default schachtSlice.reducer;

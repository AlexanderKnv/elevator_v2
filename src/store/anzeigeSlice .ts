import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AnzeigeState {
    etagenMitAnzeige: number[];
}

const initialState: AnzeigeState = {
    etagenMitAnzeige: [],
};

const anzeigeSlice = createSlice({
    name: 'anzeige',
    initialState,
    reducers: {
        addAnzeigeToEtage: (state, action: PayloadAction<number>) => {
            const etage = action.payload;
            if (!state.etagenMitAnzeige.includes(etage)) {
                state.etagenMitAnzeige.push(etage);
            }
        },
        removeAnzeigeFromEtage: (state, action: PayloadAction<number>) => {
            state.etagenMitAnzeige = state.etagenMitAnzeige.filter(n => n !== action.payload);
        },
        resetAnzeige: (state) => {
            state.etagenMitAnzeige = [];
        },
    },
});

export const { addAnzeigeToEtage, removeAnzeigeFromEtage, resetAnzeige } = anzeigeSlice.actions;
export default anzeigeSlice.reducer;

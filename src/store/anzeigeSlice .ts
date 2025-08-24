import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AnzeigeSide = 'left' | 'right';

export interface AnzeigeState {
    etagenMitAnzeige: { etage: number; sides: AnzeigeSide[] }[];
}

const initialState: AnzeigeState = {
    etagenMitAnzeige: [],
};

const anzeigeSlice = createSlice({
    name: 'anzeige',
    initialState,
    reducers: {
        addAnzeigeToEtage: (
            state,
            action: PayloadAction<{ etage: number; side: AnzeigeSide }>
        ) => {
            const { etage, side } = action.payload;
            const entry = state.etagenMitAnzeige.find((e) => e.etage === etage);

            if (entry) {
                if (!entry.sides.includes(side) && entry.sides.length < 2) {
                    entry.sides.push(side);
                }
            } else {
                state.etagenMitAnzeige.push({ etage, sides: [side] });
            }
        },
        removeAnzeigeFromEtage: (
            state,
            action: PayloadAction<{ etage: number; side: AnzeigeSide }>
        ) => {
            const { etage, side } = action.payload;
            const entry = state.etagenMitAnzeige.find((e) => e.etage === etage);
            if (!entry) return;

            entry.sides = entry.sides.filter((s) => s !== side);
            if (entry.sides.length === 0) {
                state.etagenMitAnzeige = state.etagenMitAnzeige.filter((e) => e.etage !== etage);
            }
        },
        resetAnzeige: (state, action: PayloadAction<AnzeigeState | number[]>) => {
            const payload = action.payload;
            if (Array.isArray(payload)) {
                const uniq = Array.from(new Set(payload)).sort((a, b) => a - b);
                state.etagenMitAnzeige = uniq.map((etage) => ({ etage, sides: ['left'] }));
            } else {
                state.etagenMitAnzeige = payload.etagenMitAnzeige
                    .map((e) => ({ etage: e.etage, sides: Array.from(new Set(e.sides)) as AnzeigeSide[] }))
                    .sort((a, b) => a.etage - b.etage);
            }
        },
    },
});

export const { addAnzeigeToEtage, removeAnzeigeFromEtage, resetAnzeige } = anzeigeSlice.actions;
export default anzeigeSlice.reducer;

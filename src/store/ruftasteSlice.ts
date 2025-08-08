import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Richtung = 'up' | 'down';

interface RuftasteState {
    etagenMitRuftasten: number[];
    aktiveRuftasten: { etage: number; callDirection: Richtung }[];
}

const initialState: RuftasteState = {
    etagenMitRuftasten: [],
    aktiveRuftasten: [],
};

export const ruftasteSlice = createSlice({
    name: 'ruftaste',
    initialState,
    reducers: {
        addRuftasteToEtage: (state, action: PayloadAction<number>) => {
            if (!state.etagenMitRuftasten.includes(action.payload)) {
                state.etagenMitRuftasten.push(action.payload);
            }
        },
        activateRuftaste: (
            state,
            action: PayloadAction<{ etage: number; callDirection: Richtung }>
        ) => {
            const exists = state.aktiveRuftasten.some(
                (entry) => entry.etage === action.payload.etage && entry.callDirection === action.payload.callDirection
            );
            if (!exists) {
                state.aktiveRuftasten.push(action.payload);
            }
        },
        deactivateRuftaste: (
            state,
            action: PayloadAction<{ etage: number; callDirection: Richtung }>
        ) => {
            state.aktiveRuftasten = state.aktiveRuftasten.filter(
                (entry) => !(entry.etage === action.payload.etage && entry.callDirection === action.payload.callDirection)
            );
        },
        removeRuftastenForEtage: (state, action: PayloadAction<number>) => {
            state.etagenMitRuftasten = state.etagenMitRuftasten.filter(
                (nr) => nr !== action.payload
            );
        },
    },
});

export const {
    addRuftasteToEtage,
    activateRuftaste,
    deactivateRuftaste,
    removeRuftastenForEtage,
} = ruftasteSlice.actions;
export default ruftasteSlice.reducer;

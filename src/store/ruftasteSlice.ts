import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Richtung = 'up' | 'down';

interface RuftasteState {
    etagenMitRuftasten: number[];
    aktiveRuftasten: { etage: number; richtung: Richtung }[];
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
            action: PayloadAction<{ etage: number; richtung: Richtung }>
        ) => {
            const exists = state.aktiveRuftasten.some(
                (entry) => entry.etage === action.payload.etage && entry.richtung === action.payload.richtung
            );
            if (!exists) {
                state.aktiveRuftasten.push(action.payload);
            }
        },
        deactivateRuftaste: (
            state,
            action: PayloadAction<{ etage: number; richtung: Richtung }>
        ) => {
            state.aktiveRuftasten = state.aktiveRuftasten.filter(
                (entry) => !(entry.etage === action.payload.etage && entry.richtung === action.payload.richtung)
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

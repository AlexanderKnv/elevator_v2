import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Kabine {
    id: string;
    currentEtage: number;
    doorsOpen: boolean;
}

interface KabineState {
    kabinen: Kabine[];
}

const initialState: KabineState = {
    kabinen: [],
};

const kabineSlice = createSlice({
    name: 'kabine',
    initialState,
    reducers: {
        addKabine: (state, action: PayloadAction<{ etage: number }>) => {
            const nextId = `kabine-${state.kabinen.length + 1}`;
            state.kabinen.push({
                id: nextId,
                currentEtage: action.payload.etage,
                doorsOpen: false,
            });
        },
        resetKabinen: (state, action: PayloadAction<Kabine[]>) => {
            state.kabinen = action.payload;
        },
    },
});

export const { addKabine, resetKabinen } = kabineSlice.actions;
export default kabineSlice.reducer;


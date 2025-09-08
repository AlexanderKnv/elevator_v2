import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface EtageState {
    etagen: number[];
}

const initialState: EtageState = {
    etagen: [],
};

export const etageSlice = createSlice({
    name: 'etage',
    initialState,
    reducers: {
        addEtage: (state) => {
            if (state.etagen.length < 3) {
                const newEtage = state.etagen.length + 1;
                state.etagen.push(newEtage);
            }
        },
        removeEtage: (state, action: PayloadAction<number>) => {
            state.etagen = state.etagen.filter((nr) => nr !== action.payload);
        },
        resetEtagen: (state, action: PayloadAction<number[]>) => {
            state.etagen = action.payload;
        },
    },
});

export const { addEtage, removeEtage, resetEtagen } = etageSlice.actions;
export default etageSlice.reducer;

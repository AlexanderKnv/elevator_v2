import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface RuftasteState {
    etagenMitRuftasten: number[];
}

const initialState: RuftasteState = {
    etagenMitRuftasten: [],
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
        removeRuftastenForEtage: (state, action: PayloadAction<number>) => {
            state.etagenMitRuftasten = state.etagenMitRuftasten.filter(
                (nr) => nr !== action.payload
            );
        },
    },
});

export const { addRuftasteToEtage } = ruftasteSlice.actions;
export default ruftasteSlice.reducer;

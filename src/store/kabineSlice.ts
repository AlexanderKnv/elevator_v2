// store/slices/kabineSlice.ts
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
      if (state.kabinen.length < 1) {
        state.kabinen.push({
          id: `kabine-1`,
          currentEtage: action.payload.etage,
          doorsOpen: false,
        });
      }
    },
  },
});

export const { addKabine } = kabineSlice.actions;
export default kabineSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';
// type PayloadAction

interface EtageState {
  etagen: number[]; // список этажей (например, [1, 2])
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
    resetEtagen: (state) => {
      state.etagen = [];
    },
  },
});

export const { addEtage, resetEtagen } = etageSlice.actions;
export default etageSlice.reducer;

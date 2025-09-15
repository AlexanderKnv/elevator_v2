import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GlobalsState { speedMs: number; doorTimeMs: number; }
const initialState: GlobalsState = { speedMs: 5000, doorTimeMs: 5000 };

const globalsSlice = createSlice({
    name: "globals",
    initialState,
    reducers: {
        resetGlobals: (state, action: PayloadAction<Partial<GlobalsState>>) => {
            if (action.payload.speedMs !== undefined) state.speedMs = action.payload.speedMs;
            if (action.payload.doorTimeMs !== undefined) state.doorTimeMs = action.payload.doorTimeMs;
        },
        setSpeedMs: (s, a: PayloadAction<number>) => { s.speedMs = a.payload; },
        setDoorTimeMs: (s, a: PayloadAction<number>) => { s.doorTimeMs = a.payload; },
    }
});
export const { resetGlobals, setSpeedMs, setDoorTimeMs } = globalsSlice.actions;
export default globalsSlice.reducer;

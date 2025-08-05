import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Kabine {
    id: string;
    currentEtage: number;
    doorsOpen: boolean;
    targetEtage: number | null;
    isMoving: boolean;
    callQueue: number[];
    richtung: 'up' | 'down' | null;
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
                targetEtage: null,
                isMoving: false,
                callQueue: [],
                richtung: null,
            });
        },
        setTargetEtage: (state, action: PayloadAction<number>) => {
            const kabine = state.kabinen[0];
            if (!kabine || kabine.isMoving) return;
            kabine.targetEtage = action.payload;
            kabine.isMoving = true;
            kabine.doorsOpen = false;
        },
        completeMovement: (state) => {
            const kabine = state.kabinen[0];
            if (!kabine || kabine.targetEtage === null) return;
            kabine.currentEtage = kabine.targetEtage;
            kabine.targetEtage = null;
            kabine.isMoving = false;
        },
        openDoors: (state) => {
            const kabine = state.kabinen[0];
            if (!kabine) return;
            kabine.doorsOpen = !kabine.doorsOpen;
        },
        addCallToQueue: (state, action: PayloadAction<number>) => {
            const kabine = state.kabinen[0];
            if (!kabine) return;

            if (!kabine.callQueue.includes(action.payload)) {
                kabine.callQueue.push(action.payload);
            }
        },
        removeCallFromQueue: (state, action: PayloadAction<number>) => {
            const kabine = state.kabinen[0];
            if (!kabine) return;
            kabine.callQueue = kabine.callQueue.filter(etage => etage !== action.payload);
        },
        setRichtung: (state, action: PayloadAction<'up' | 'down' | null>) => {
            if (state.kabinen[0]) {
                state.kabinen[0].richtung = action.payload;
            }
        },
        resetKabinen: (state, action: PayloadAction<Kabine[]>) => {
            state.kabinen = action.payload;
        },
    },
});

export const {
    addKabine,
    resetKabinen,
    setTargetEtage,
    completeMovement,
    openDoors,
    addCallToQueue,
    removeCallFromQueue,
    setRichtung
} = kabineSlice.actions;
export default kabineSlice.reducer;


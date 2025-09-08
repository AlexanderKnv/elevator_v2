import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type KabineSide = 'left' | 'right';

export interface Kabine {
    id: string;
    side: KabineSide;
    currentEtage: number;
    doorsOpen: boolean;
    targetEtage: number | null;
    isMoving: boolean;
    callQueue: number[];
    directionMovement: 'up' | 'down' | null;
    hasBedienpanel: boolean;
    aktiveZielEtagen: number[];
    doorsState: 'open' | 'closed' | 'opening' | 'closing';
}

interface KabineState {
    kabinen: Kabine[];
}

const initialState: KabineState = {
    kabinen: [],
};

// helpers
const findIndexBySide = (state: KabineState, side: KabineSide) =>
    state.kabinen.findIndex((k) => k.side === side);

const mustGetBySide = (state: KabineState, side: KabineSide) => {
    const idx = findIndexBySide(state, side);
    return idx >= 0 ? state.kabinen[idx] : undefined;
};

export const kabineSlice = createSlice({
    name: 'kabine',
    initialState,
    reducers: {
        addKabine: (
            state,
            action: PayloadAction<{ etage: number; side: KabineSide }>
        ) => {
            const { etage, side } = action.payload;
            if (findIndexBySide(state, side) !== -1) return;
            const nextId = `kabine-${side}`;
            state.kabinen.push({
                id: nextId,
                side,
                currentEtage: etage,
                doorsOpen: false,
                targetEtage: null,
                isMoving: false,
                callQueue: [],
                directionMovement: null,
                hasBedienpanel: false,
                aktiveZielEtagen: [],
                doorsState: 'closed',
            });
        },

        removeKabine: (state, action: PayloadAction<{ side: KabineSide }>) => {
            state.kabinen = state.kabinen.filter((k) => k.side !== action.payload.side);
        },

        setCurrentEtage: (state, action: PayloadAction<{ side: KabineSide; etage: number }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (k) k.currentEtage = action.payload.etage;
        },

        setTargetEtage: (state, action: PayloadAction<{ side: KabineSide; etage: number }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (!k || k.isMoving) return;
            k.targetEtage = action.payload.etage;
            k.isMoving = true;
            k.doorsOpen = false;
        },

        completeMovement: (state, action: PayloadAction<{ side: KabineSide }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (!k || k.targetEtage === null) return;
            k.currentEtage = k.targetEtage;
            k.targetEtage = null;
            k.isMoving = false;
        },

        openDoors: (state, action: PayloadAction<{ side: KabineSide }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (k) k.doorsOpen = !k.doorsOpen;
        },

        addCallToQueue: (state, action: PayloadAction<{ side: KabineSide; etage: number }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (!k) return;
            if (!k.callQueue.includes(action.payload.etage)) {
                k.callQueue.push(action.payload.etage);
            }
        },
        removeCallFromQueue: (state, action: PayloadAction<{ side: KabineSide; etage: number }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (!k) return;
            k.callQueue = k.callQueue.filter((e) => e !== action.payload.etage);
        },

        setDirectionMovement: (
            state,
            action: PayloadAction<{ side: KabineSide; direction: 'up' | 'down' | null }>
        ) => {
            const k = mustGetBySide(state, action.payload.side);
            if (k) k.directionMovement = action.payload.direction;
        },

        addZielEtage: (state, action: PayloadAction<{ side: KabineSide; etage: number }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (!k) return;
            if (!k.aktiveZielEtagen.includes(action.payload.etage)) {
                k.aktiveZielEtagen.push(action.payload.etage);
            }
        },
        removeZielEtage: (state, action: PayloadAction<{ side: KabineSide; etage: number }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (!k) return;
            k.aktiveZielEtagen = k.aktiveZielEtagen.filter((e) => e !== action.payload.etage);
        },

        addBedienpanelToKabine: (state, action: PayloadAction<{ side: KabineSide }>) => {
            const k = mustGetBySide(state, action.payload.side);
            if (k) k.hasBedienpanel = true;
        },

        setDoorsState: (
            state,
            action: PayloadAction<{ side: KabineSide; state: 'open' | 'closed' | 'opening' | 'closing' }>
        ) => {
            const k = mustGetBySide(state, action.payload.side);
            if (k) k.doorsState = action.payload.state;
        },

        resetKabinen: (state, action: PayloadAction<Kabine[]>) => {
            state.kabinen = action.payload;
        },
    },
});

export const {
    addKabine,
    removeKabine,
    resetKabinen,
    setTargetEtage,
    completeMovement,
    openDoors,
    addCallToQueue,
    removeCallFromQueue,
    setDirectionMovement,
    addBedienpanelToKabine,
    addZielEtage,
    removeZielEtage,
    setDoorsState,
    setCurrentEtage,
} = kabineSlice.actions;
export default kabineSlice.reducer;

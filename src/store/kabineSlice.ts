import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Kabine {
    id: string;
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
                directionMovement: null,
                hasBedienpanel: false,
                aktiveZielEtagen: [],
                doorsState: 'closed',
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
        setDirectionMovement: (state, action: PayloadAction<'up' | 'down' | null>) => {
            if (state.kabinen[0]) {
                state.kabinen[0].directionMovement = action.payload;
            }
        },
        resetKabinen: (state, action: PayloadAction<Kabine[]>) => {
            state.kabinen = action.payload;
        },
        addZielEtage: (state, action: PayloadAction<number>) => {
            if (!state.kabinen[0].aktiveZielEtagen.includes(action.payload)) {
                state.kabinen[0].aktiveZielEtagen.push(action.payload);
            }
        },
        removeZielEtage: (state, action: PayloadAction<number>) => {
            state.kabinen[0].aktiveZielEtagen = state.kabinen[0].aktiveZielEtagen.filter(
                (etage) => etage !== action.payload
            );
        },
        addBedienpanelToKabine: (state) => {
            if (state.kabinen[0]) {
                state.kabinen[0].hasBedienpanel = true;
            }
        },
        setDoorsState: (state, action: PayloadAction<'open' | 'closed' | 'opening' | 'closing'>) => {
            const kabine = state.kabinen[0];
            if (kabine) {
                kabine.doorsState = action.payload;
            }
        }

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
    setDirectionMovement,
    addBedienpanelToKabine,
    addZielEtage,
    removeZielEtage,
    setDoorsState,
} = kabineSlice.actions;
export default kabineSlice.reducer;


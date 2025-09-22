/** @packageDocumentation
 * # Schacht-Slice (`schachtSlice.ts`)
 *
 * Zustandsverwaltung für Schachtseiten je Etage eines Aufzugs.
 *
 * - Hält eine Liste von Etagen (`etage`) mit zugehörigen Schachtseiten (`sides`).
 * - `addSchachtToEtage` fügt eine Seite hinzu, vermeidet Duplikate und begrenzt auf max. **2** Seiten.
 * - `removeSchachtFromEtage` entfernt eine Seite; leere Etagen-Einträge werden automatisch gelöscht.
 * - `resetSchacht` ersetzt den Zustand aus einer Payload, **entdoppelt** Seiten und **sortiert** nach Etage (aufsteigend).
 */


import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SchachtSide = 'left' | 'right';

export interface SchachtState {
    etagenMitSchacht: { etage: number; sides: SchachtSide[] }[];
}

const initialState: SchachtState = {
    etagenMitSchacht: [],
};

const schachtSlice = createSlice({
    name: 'schacht',
    initialState,
    reducers: {
        addSchachtToEtage: (
            state,
            action: PayloadAction<{ etage: number; side: SchachtSide }>
        ) => {
            const { etage, side } = action.payload;
            const entry = state.etagenMitSchacht.find((e) => e.etage === etage);

            if (entry) {
                if (!entry.sides.includes(side) && entry.sides.length < 2) {
                    entry.sides.push(side);
                }
            } else {
                state.etagenMitSchacht.push({ etage, sides: [side] });
            }
        },
        removeSchachtFromEtage: (
            state,
            action: PayloadAction<{ etage: number; side: SchachtSide }>
        ) => {
            const { etage, side } = action.payload;
            const entry = state.etagenMitSchacht.find((e) => e.etage === etage);
            if (!entry) return;

            entry.sides = entry.sides.filter((s) => s !== side);

            if (entry.sides.length === 0) {
                state.etagenMitSchacht = state.etagenMitSchacht.filter(
                    (e) => e.etage !== etage
                );
            }
        },
        resetSchacht: (state, action: PayloadAction<SchachtState>) => {
            state.etagenMitSchacht = action.payload.etagenMitSchacht
                .map(e => ({ etage: e.etage, sides: Array.from(new Set(e.sides)) as SchachtSide[] }))
                .sort((a, b) => a.etage - b.etage);
        },
    },
});

export const { addSchachtToEtage, removeSchachtFromEtage, resetSchacht } = schachtSlice.actions;
export default schachtSlice.reducer;
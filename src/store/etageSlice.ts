/** @packageDocumentation
 * # Etagen-Slice (`etageSlice.ts`)
 *
 * Verwaltung der **Etagenliste** (nummerierte Stockwerke) der Anwendung.
 *
 * **State**
 * ```ts
 * interface EtageState { etagen: number[] }
 * ```
 *
 * **Aufgaben**
 * - `addEtage()` fügt eine neue Etage am Ende an (Nummer = `length + 1`) — **max. 3** Etagen.
 * - `removeEtage(nr)` entfernt die Etage mit Nummer `nr` und **renummeriert** anschließend
 *   lückenlos auf `[1..N]` in aufsteigender Reihenfolge.
 * - `resetEtagen(list)` setzt die Etagenliste direkt aus der Payload.
 */

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
            state.etagen = state.etagen
                .sort((a, b) => a - b)
                .map((_, i) => i + 1);
        },
        resetEtagen: (state, action: PayloadAction<number[]>) => {
            state.etagen = action.payload;
        },
    },
});

export const { addEtage, removeEtage, resetEtagen } = etageSlice.actions;
export default etageSlice.reducer;

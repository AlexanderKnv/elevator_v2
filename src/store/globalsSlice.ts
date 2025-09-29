/** @packageDocumentation
 * # Globale Parameter (`globalsSlice.ts`)
 *
 * Zentrale, globale **Simulations-/Timing-Einstellungen** für die Anwendung.
 *
 * **State**
 * ```ts
 * export interface GlobalsState {
 *   speedMs: number;    // Fahr-/Bewegungsdauer in Millisekunden
 *   doorTimeMs: number; // Tür-Öffnen/Schließen-Dauer in Millisekunden
 * }
 * ```
 * Standardwerte: `speedMs = 5000`, `doorTimeMs = 5000`.
 *
 * **Aufgaben**
 * - `resetGlobals(partial)` — setzt ausgewählte Felder neu.
 * - `setSpeedMs(ms)` — setzt die Fahrgeschwindigkeit/-dauer.
 * - `setDoorTimeMs(ms)` — setzt die Tür-Zeit.
 */

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

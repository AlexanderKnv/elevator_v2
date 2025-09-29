/** @packageDocumentation
 * # Tests: Etage-Slice (`etageSlice.spec.ts`)
 *
 * - Initialzustand:
 *   - Eingabe: `etageReducer(undefined, { type: '@@INIT' })`
 *   - Erwartung: `{ etagen: [] }`
 *
 * - `addEtage` — fügt erste Etage hinzu, wenn leer:
 *   - Eingabe: Startzustand → `addEtage()`
 *   - Erwartung: `etagen = [1]`
 *
 * - `addEtage` — sequentiell bis max. drei Etagen:
 *   - Eingabe: dreimal `addEtage()` nacheinander
 *   - Erwartung: `etagen = [1, 2, 3]`
 *
 * - `addEtage` — überschreitet Limit 3 nicht (No-Op ab viertem Aufruf):
 *   - Eingabe: nach `etagen = [1,2,3]` erneut `addEtage()`
 *   - Erwartung: Zustand **unverändert** (`[1,2,3]`)
 *
 * - `resetEtagen` — setzt Liste exakt auf Payload:
 *   - Eingabe: `resetEtagen([3, 1, 1, 2])`
 *   - Erwartung: `etagen = [3, 1, 1, 2]` (keine Deduplizierung/Sortierung)
 *
 * - `addEtage` nach `resetEtagen` — neue ID richtet sich nach **Länge**, nicht nach Maximalwert:
 *   - Eingabe: `resetEtagen([10,20])` → danach `addEtage()`
 *   - Erwartung: `etagen = [10, 20, 3]`
 */

import etageReducer, { addEtage, resetEtagen } from "../store/etageSlice";
import { describe, it, expect } from "vitest";

// Hilfsfunktion: initialen Zustand über den Reducer ermitteln.
const initState = () => etageReducer(undefined as any, { type: "@@INIT" } as any);

describe("etageSlice", () => {
    // Prüft, dass der Reducer ohne Aktion den Anfangszustand liefert.
    it("gibt den Anfangszustand zurück", () => {
        const state = initState();
        expect(state).toEqual({ etagen: [] });
    });

    // addEtage: Fügt die erste Etage (1) hinzu, wenn die Liste leer ist.
    it("addEtage: fügt die erste Etage 1 hinzu, wenn leer", () => {
        const s1 = initState();
        const s2 = etageReducer(s1, addEtage());
        expect(s2.etagen).toEqual([1]);
    });

    // addEtage: Fügt sequentiell bis zu drei Etagen hinzu (1,2,3).
    it("addEtage: fügt sequentiell bis max. 3 Etagen hinzu", () => {
        const s1 = initState();
        const s2 = etageReducer(s1, addEtage()); // [1]
        const s3 = etageReducer(s2, addEtage()); // [1,2]
        const s4 = etageReducer(s3, addEtage()); // [1,2,3]

        expect(s4.etagen).toEqual([1, 2, 3]);
    });

    // addEtage: Überschreitet das Limit von 3 nicht; weiterer Aufruf ist No-Op.
    it("addEtage: überschreitet das Limit 3 nicht (No-Op ab dem 4. Aufruf)", () => {
        const s1 = initState();
        const s2 = etageReducer(etageReducer(etageReducer(s1, addEtage()), addEtage()), addEtage()); // [1,2,3]
        const s3 = etageReducer(s2, addEtage()); // Versuch, eine 4. Etage hinzuzufügen → ignoriert

        expect(s2.etagen).toEqual([1, 2, 3]);
        expect(s3).toEqual(s2);
    });

    // resetEtagen: Setzt die Liste exakt auf das übergebene Array
    it("resetEtagen: setzt die Liste exakt auf Payload", () => {
        const start = initState();
        const next = etageReducer(start, resetEtagen([3, 1, 1, 2]));
        expect(next.etagen).toEqual([3, 1, 1, 2]);
    });

    // addEtage nach resetEtagen: Die neue ID basiert auf der Länge der Liste, nicht auf deren Maximalwert.
    // Beispiel: Nach resetEtagen([10,20]) ist die Länge 2 → addEtage fügt die 3 hinzu, Ergebnis [10,20,3].
    it("addEtage nach resetEtagen: neue ID richtet sich nach Länge, nicht nach Maximalwert", () => {
        const start = initState();
        const s1 = etageReducer(start, resetEtagen([10, 20]));
        const s2 = etageReducer(s1, addEtage());
        expect(s2.etagen).toEqual([10, 20, 3]);
    });
});

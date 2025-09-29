/** @packageDocumentation
 * # Tests: Kabine-Slice (`kabineSlice.spec.ts`)
 *
 * - Initialzustand:
 *   - Eingabe: `kabineReducer(undefined, { type: '@@INIT' })`
 *   - Erwartung: `{ kabinen: [] }`
 *
 * - `addKabine` — legt eine neue Kabine mit Defaultwerten an:
 *   - Eingabe: Startzustand → `addKabine({ etage: 3, side: 'left' })`
 *   - Erwartung: genau **1** Kabine mit
 *     `id: "kabine-left"`, `side: "left"`, `currentEtage: 3`,
 *     `doorsOpen: false`, `targetEtage: null`, `isMoving: false`,
 *     `callQueue: []`, `directionMovement: null`, `hasBedienpanel: false`,
 *     `aktiveZielEtagen: []`, `doorsState: "closed"`
 *
 * - `addKabine` — verhindert Duplikate pro Seite:
 *   - Eingabe: erst `addKabine({ side: 'left' })`, danach erneut `addKabine({ side: 'left' })`
 *   - Erwartung: zweiter Aufruf ist **No-Op**; `addKabine({ side: 'right' })` fügt zweite Kabine hinzu
 *   - Ergebnis: Seitenmenge = `['left','right']`
 *
 * - `setCurrentEtage` — setzt aktuelle Etage / No-Op bei unbekannter Seite:
 *   - Eingabe: vorhandene `left`-Kabine → `setCurrentEtage({ side: 'left', etage: 7 })`
 *   - Erwartung: `currentEtage: 7`; anschließend `setCurrentEtage({ side: 'right', etage: 9 })` ist **No-Op**
 *
 * - `setTargetEtage` — setzt Ziel, startet Bewegung, schließt Türen; No-Op während Bewegung:
 *   - Eingabe: `setTargetEtage({ side: 'left', etage: 5 })`
 *   - Erwartung: `targetEtage: 5`, `isMoving: true`, `doorsOpen: false`
 *   - Weiterer Aufruf `setTargetEtage(...)` solange `isMoving: true` → **No-Op**
 *
 * - `completeMovement` — übernimmt Ziel als aktuelle Etage und beendet Bewegung; No-Op ohne Ziel:
 *   - Eingabe: nach gesetztem Ziel `completeMovement({ side: 'left' })`
 *   - Erwartung: `currentEtage = targetEtage`, `isMoving: false`, `targetEtage: null`
 *   - erneuter Aufruf ohne Ziel → **No-Op**
 *
 * - `openDoors` — toggelt Türstatus; No-Op bei unbekannter Seite:
 *   - Eingabe: zweimal `openDoors({ side: 'left' })`
 *   - Erwartung: `doorsOpen` wechselt `false → true → false`
 *   - `openDoors({ side: 'right' })` ohne `right`-Kabine → **No-Op**
 *
 * - Call-Queue (`addCallToQueue` / `removeCallFromQueue`) — fügt ohne Duplikate hinzu, entfernt korrekt:
 *   - Eingabe: `addCallToQueue({ etage: 2 })`, nochmals `etage: 2`, dann `etage: 3`
 *   - Erwartung: Queue `=[2,3]` (Duplikat ignoriert); `removeCallFromQueue({ etage: 2 })` → `[3]`;
 *     Entfernen einer nicht vorhandenen Etage → **No-Op**
 *
 * - `setDirectionMovement` — setzt Fahrtrichtung:
 *   - Eingabe: nacheinander `up`, `down`, `null`
 *   - Erwartung: `directionMovement: 'up' → 'down' → null`
 *
 * - Ziel-Etagen (`addZielEtage` / `removeZielEtage`) — ohne Duplikate, korrektes Entfernen:
 *   - Eingabe: `addZielEtage(10)`, erneut `10`, dann `11`; anschließend `removeZielEtage(10)`
 *   - Erwartung: Liste `=[10,11]` (Duplikat ignoriert) → nach Entfernen `=[11]`
 *
 * - `addBedienpanelToKabine` — setzt Flag idempotent:
 *   - Eingabe: zweimal `addBedienpanelToKabine({ side: 'left' })`
 *   - Erwartung: `hasBedienpanel: true` bleibt **true**
 *
 * - `setDoorsState` — setzt gültige Türzustände:
 *   - Eingabe: der Reihe nach `opening → open → closing → closed`
 *   - Erwartung: `doorsState` entspricht jeweils dem gesetzten Wert
 *
 * - `resetKabinen` — ersetzt Liste exakt durch Payload:
 *   - Eingabe: `resetKabinen([makeKabine('right', { currentEtage: 9 })])`
 *   - Erwartung: Zustand exakt wie Payload (`kabinen` nur `right` mit `currentEtage: 9`)
 *
 * - `resetKabinen` + `addKabine` — Duplikat-Seite weiterhin verhindert:
 *   - Eingabe: nach `resetKabinen([makeKabine('left')])` anschließend `addKabine({ side: 'left' })`
 *   - Erwartung: **No-Op** (zweite `left`-Kabine wird nicht angelegt)
 */

import kabineReducer, {
    addKabine,
    setCurrentEtage,
    setTargetEtage,
    completeMovement,
    openDoors,
    addCallToQueue,
    removeCallFromQueue,
    setDirectionMovement,
    addZielEtage,
    removeZielEtage,
    addBedienpanelToKabine,
    setDoorsState,
    resetKabinen,
    type Kabine,
} from "../store/kabineSlice";
import { describe, it, expect } from "vitest";

const initState = () => kabineReducer(undefined as any, { type: "@@INIT" } as any);

const makeKabine = (side: "left" | "right", overrides: Partial<Kabine> = {}): Kabine => ({
    id: `kabine-${side}`,
    side,
    currentEtage: 1,
    doorsOpen: false,
    targetEtage: null,
    isMoving: false,
    callQueue: [],
    directionMovement: null,
    hasBedienpanel: false,
    aktiveZielEtagen: [],
    doorsState: "closed",
    ...overrides,
});

describe("kabineSlice", () => {
    // Prüft, dass der Reducer den korrekten Anfangszustand liefert (keine Kabinen).
    it("liefert den Anfangszustand", () => {
        const state = initState();
        expect(state).toEqual({ kabinen: [] });
    });

    // addKabine: Fügt eine Kabine für die angegebene Seite hinzu und setzt alle Standardwerte korrekt.
    it("addKabine: erstellt eine neue Kabine mit Defaultwerten", () => {
        const s1 = initState();
        const s2 = kabineReducer(s1, addKabine({ etage: 3, side: "left" }));

        expect(s2.kabinen).toHaveLength(1);
        const k = s2.kabinen[0];
        expect(k.id).toBe("kabine-left");
        expect(k.side).toBe("left");
        expect(k.currentEtage).toBe(3);
        expect(k.doorsOpen).toBe(false);
        expect(k.targetEtage).toBeNull();
        expect(k.isMoving).toBe(false);
        expect(k.callQueue).toEqual([]);
        expect(k.directionMovement).toBeNull();
        expect(k.hasBedienpanel).toBe(false);
        expect(k.aktiveZielEtagen).toEqual([]);
        expect(k.doorsState).toBe("closed");
    });

    // addKabine: Verhindert Duplikate pro Seite; zweite Kabine mit derselben Seite ist ein No-Op.
    it("addKabine: verhindert Duplikate pro Seite", () => {
        const s1 = initState();
        const s2 = kabineReducer(s1, addKabine({ etage: 1, side: "left" }));
        const s3 = kabineReducer(s2, addKabine({ etage: 5, side: "left" })); // No-Op
        const s4 = kabineReducer(s3, addKabine({ etage: 2, side: "right" })); // andere Seite erlaubt

        expect(s2.kabinen).toHaveLength(1);
        expect(s3).toEqual(s2);
        expect(s4.kabinen.map(k => k.side).sort()).toEqual(["left", "right"]);
    });

    // setCurrentEtage: Setzt die aktuelle Etage der Kabine; bei unbekannter Seite No-Op.
    it("setCurrentEtage: setzt aktuelle Etage oder ist No-Op bei unbekannter Seite", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, setCurrentEtage({ side: "left", etage: 7 }));
        expect(s2.kabinen[0].currentEtage).toBe(7);

        const s3 = kabineReducer(s2, setCurrentEtage({ side: "right", etage: 9 })); // No-Op
        expect(s3).toEqual(s2);
    });

    // setTargetEtage: Setzt Ziel und startet Bewegung (isMoving=true, doorsOpen=false); erneuter Aufruf während Bewegung ist No-Op.
    it("setTargetEtage: setzt Ziel, startet Bewegung und schließt Türen; No-Op wenn bereits in Bewegung", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, setTargetEtage({ side: "left", etage: 5 }));

        const k2 = s2.kabinen[0];
        expect(k2.targetEtage).toBe(5);
        expect(k2.isMoving).toBe(true);
        expect(k2.doorsOpen).toBe(false);

        const s3 = kabineReducer(s2, setTargetEtage({ side: "left", etage: 8 }));
        expect(s3).toEqual(s2);
    });

    // completeMovement: Beendet Bewegung, setzt currentEtage=targetEtage und löscht targetEtage; No-Op ohne Ziel.
    it("completeMovement: setzt currentEtage auf Ziel, beendet Bewegung; No-Op ohne Ziel", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, setTargetEtage({ side: "left", etage: 4 }));
        const s3 = kabineReducer(s2, completeMovement({ side: "left" }));

        const k3 = s3.kabinen[0];
        expect(k3.currentEtage).toBe(4);
        expect(k3.isMoving).toBe(false);
        expect(k3.targetEtage).toBeNull();

        const s4 = kabineReducer(s3, completeMovement({ side: "left" })); // No-Op (kein Ziel)
        expect(s4).toEqual(s3);
    });

    // openDoors: Toggle des Türstatus (true/false), No-Op bei unbekannter Seite.
    it("openDoors: toggelt doorsOpen und ist No-Op bei unbekannter Seite", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, openDoors({ side: "left" }));
        expect(s2.kabinen[0].doorsOpen).toBe(true);
        const s3 = kabineReducer(s2, openDoors({ side: "left" }));
        expect(s3.kabinen[0].doorsOpen).toBe(false);

        const s4 = kabineReducer(s3, openDoors({ side: "right" })); // No-Op
        expect(s4).toEqual(s3);
    });

    // addCallToQueue/removeCallFromQueue: Fügt Etagen ohne Duplikate hinzu und entfernt sie wieder.
    it("CallQueue: fügt ohne Duplikate hinzu und entfernt korrekt", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, addCallToQueue({ side: "left", etage: 2 }));
        const s3 = kabineReducer(s2, addCallToQueue({ side: "left", etage: 2 })); // Duplikat → ignoriert
        const s4 = kabineReducer(s3, addCallToQueue({ side: "left", etage: 3 }));

        expect(s4.kabinen[0].callQueue).toEqual([2, 3]);

        const s5 = kabineReducer(s4, removeCallFromQueue({ side: "left", etage: 2 }));
        expect(s5.kabinen[0].callQueue).toEqual([3]);

        const s6 = kabineReducer(s5, removeCallFromQueue({ side: "left", etage: 99 })); // No-Op
        expect(s6).toEqual(s5);
    });

    // setDirectionMovement: Setzt die Fahrtrichtung frei (up/down/null).
    it("setDirectionMovement: setzt Richtung up/down/null", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, setDirectionMovement({ side: "left", direction: "up" }));
        expect(s2.kabinen[0].directionMovement).toBe("up");
        const s3 = kabineReducer(s2, setDirectionMovement({ side: "left", direction: "down" }));
        expect(s3.kabinen[0].directionMovement).toBe("down");
        const s4 = kabineReducer(s3, setDirectionMovement({ side: "left", direction: null }));
        expect(s4.kabinen[0].directionMovement).toBeNull();
    });

    // addZielEtage/removeZielEtage: Verwaltet aktive Ziel-Etagen ohne Duplikate.
    it("ZielEtagen: fügt ohne Duplikate hinzu und entfernt korrekt", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, addZielEtage({ side: "left", etage: 10 }));
        const s3 = kabineReducer(s2, addZielEtage({ side: "left", etage: 10 }));
        const s4 = kabineReducer(s3, addZielEtage({ side: "left", etage: 11 }));

        expect(s4.kabinen[0].aktiveZielEtagen).toEqual([10, 11]);

        const s5 = kabineReducer(s4, removeZielEtage({ side: "left", etage: 10 }));
        expect(s5.kabinen[0].aktiveZielEtagen).toEqual([11]);
    });

    // addBedienpanelToKabine: Markiert die Kabine als mit Bedienpanel ausgestattet; idempotent.
    it("addBedienpanelToKabine: setzt hasBedienpanel auf true (idempotent)", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, addBedienpanelToKabine({ side: "left" }));
        expect(s2.kabinen[0].hasBedienpanel).toBe(true);
        const s3 = kabineReducer(s2, addBedienpanelToKabine({ side: "left" }));
        expect(s3.kabinen[0].hasBedienpanel).toBe(true);
    });

    // setDoorsState: Setzt den Türzustand auf einen der erlaubten Werte.
    it("setDoorsState: setzt den Türzustand (open/closed/opening/closing)", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const s2 = kabineReducer(s1, setDoorsState({ side: "left", state: "opening" }));
        expect(s2.kabinen[0].doorsState).toBe("opening");
        const s3 = kabineReducer(s2, setDoorsState({ side: "left", state: "open" }));
        expect(s3.kabinen[0].doorsState).toBe("open");
        const s4 = kabineReducer(s3, setDoorsState({ side: "left", state: "closing" }));
        expect(s4.kabinen[0].doorsState).toBe("closing");
        const s5 = kabineReducer(s4, setDoorsState({ side: "left", state: "closed" }));
        expect(s5.kabinen[0].doorsState).toBe("closed");
    });

    // resetKabinen: Ersetzt den Zustand exakt durch den Payload-Inhalt.
    it("resetKabinen: ersetzt die Liste exakt durch Payload", () => {
        const s1 = kabineReducer(initState(), addKabine({ etage: 1, side: "left" }));
        const payload = [makeKabine("right", { currentEtage: 9 })];
        const s2 = kabineReducer(s1, resetKabinen(payload));
        expect(s2.kabinen).toEqual(payload);
    });

    // Kombination: Nach resetKabinen darf addKabine keine Duplikat-Seite zulassen.
    it("resetKabinen + addKabine: verhindert Duplikat-Seite weiterhin", () => {
        const s1 = initState();
        const s2 = kabineReducer(s1, resetKabinen([makeKabine("left")]))
        const s3 = kabineReducer(s2, addKabine({ etage: 5, side: "left" }));
        expect(s3).toEqual(s2);
    });
});

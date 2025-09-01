import { describe, it, expect } from "vitest";
import anzeigeReducer, { addAnzeigeToEtage, removeAnzeigeFromEtage, resetAnzeige } from './anzeigeSlice ';

const initState = () => anzeigeReducer(undefined as any, { type: "@@INIT" } as any);

const sortSides = (sides: Array<"left" | "right">) => [...sides].sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1));

describe("anzeigeSlice", () => {
    // Prüft, dass der Reducer den korrekten Anfangszustand (Default-State) zurückgibt.
    it("returns initial state", () => {
        const state = initState();
        expect(state).toEqual({ etagenMitAnzeige: [] });
    });
    // Das Hinzufügen einer Anzeige zu einem Stockwerk erzeugt einen neuen Eintrag, falls keiner existiert.
    it("addAnzeigeToEtage: creates an entry when none exists", () => {
        const state = initState();
        const next = anzeigeReducer(state, addAnzeigeToEtage({ etage: 1, side: "left" }));

        expect(next.etagenMitAnzeige).toHaveLength(1);
        expect(next.etagenMitAnzeige[0].etage).toBe(1);
        expect(sortSides(next.etagenMitAnzeige[0].sides)).toEqual(["left"]);
    });
    // Fügt die zweite Seite zu einem vorhandenen Eintrag hinzu und verhindert Duplikate (maximal 2 Seiten).
    it("addAnzeigeToEtage: adds second side and prevents duplicates (max 2)", () => {
        const s1 = initState();
        const s2 = anzeigeReducer(s1, addAnzeigeToEtage({ etage: 2, side: "left" }));
        const s3 = anzeigeReducer(s2, addAnzeigeToEtage({ etage: 2, side: "right" }));
        const s4 = anzeigeReducer(s3, addAnzeigeToEtage({ etage: 2, side: "right" }));

        expect(s3.etagenMitAnzeige).toHaveLength(1);
        expect(sortSides(s3.etagenMitAnzeige[0].sides)).toEqual(["left", "right"]);
        expect(s4).toEqual(s3);
    });
    // Stellt sicher, dass ein Eintrag nicht mehr als zwei Seiten hat; weitere Aktionen sind No-Op.
    it("addAnzeigeToEtage: does not exceed 2 sides", () => {
        const s1 = initState();
        const s2 = anzeigeReducer(s1, addAnzeigeToEtage({ etage: 3, side: "left" }));
        const s3 = anzeigeReducer(s2, addAnzeigeToEtage({ etage: 3, side: "right" }));
        const s4 = anzeigeReducer(s3, addAnzeigeToEtage({ etage: 3, side: "left" }));

        expect(sortSides(s3.etagenMitAnzeige[0].sides)).toEqual(["left", "right"]);
        expect(s4).toEqual(s3);
    });
    // Entfernt eine bestimmte Seite; wird die letzte entfernt, wird der Eintrag vollständig gelöscht.
    it("removeAnzeigeFromEtage: removes a specific side and deletes entry when last side removed", () => {
        const start = initState();
        const s1 = anzeigeReducer(start, addAnzeigeToEtage({ etage: 5, side: "left" }));
        const s2 = anzeigeReducer(s1, addAnzeigeToEtage({ etage: 5, side: "right" }));

        const s3 = anzeigeReducer(s2, removeAnzeigeFromEtage({ etage: 5, side: "right" }));
        expect(s3.etagenMitAnzeige).toHaveLength(1);
        expect(s3.etagenMitAnzeige[0].etage).toBe(5);
        expect(sortSides(s3.etagenMitAnzeige[0].sides)).toEqual(["left"]);

        const s4 = anzeigeReducer(s3, removeAnzeigeFromEtage({ etage: 5, side: "left" }));
        expect(s4.etagenMitAnzeige).toEqual([]);
    });
    // Der Versuch, eine nicht vorhandene Seite oder ein Stockwerk zu entfernen, ändert den Zustand nicht (No-Op).
    it("removeAnzeigeFromEtage: no-ops on missing etage or side", () => {
        const s1 = initState();
        const s2 = anzeigeReducer(s1, addAnzeigeToEtage({ etage: 7, side: "left" }));

        const s3 = anzeigeReducer(s2, removeAnzeigeFromEtage({ etage: 7, side: "right" }));
        expect(s3).toEqual(s2);

        const s4 = anzeigeReducer(s3, removeAnzeigeFromEtage({ etage: 42, side: "left" }));
        expect(s4).toEqual(s3);
    });
    // Bei einem Array-Payload: dedupliziert und sortiert Stockwerke, jeder Eintrag erhält ['left'].
    it("resetAnzeige: accepts array payload, uniquifies & sorts etagen, assigns ['left']", () => {
        const start = initState();
        const next = anzeigeReducer(start, resetAnzeige([3, 1, 1, 2]));

        expect(next.etagenMitAnzeige.map(e => e.etage)).toEqual([1, 2, 3]);
        next.etagenMitAnzeige.forEach((e) => {
            expect(sortSides(e.sides)).toEqual(["left"]);
        });
    });
    // Beim vollen State: entfernt Duplikate in den Seiten jedes Eintrags und sortiert nach Stockwerk.
    it("resetAnzeige: accepts full state payload, dedupes sides within each entry and sorts by etage", () => {
        const start = initState();
        const payload = {
            etagenMitAnzeige: [
                { etage: 2, sides: ["right", "left", "left"] as Array<"left" | "right"> },
                { etage: 1, sides: ["left"] as Array<"left" | "right"> },
            ],
        };

        const next = anzeigeReducer(start, resetAnzeige(payload));

        expect(next.etagenMitAnzeige.map(e => e.etage)).toEqual([1, 2]);

        const e1 = next.etagenMitAnzeige.find(e => e.etage === 1)!;
        const e2 = next.etagenMitAnzeige.find(e => e.etage === 2)!;
        expect(sortSides(e1.sides)).toEqual(["left"]);
        expect(sortSides(e2.sides)).toEqual(["left", "right"]);
    });
});

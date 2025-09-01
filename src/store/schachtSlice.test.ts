import schachtReducer, {
    addSchachtToEtage,
    removeSchachtFromEtage,
    resetSchacht,
} from "../store/schachtSlice";
import { describe, it, expect } from "vitest";

const initState = () => schachtReducer(undefined as any, { type: "@@INIT" } as any);

const sortSides = (sides: Array<"left" | "right">) => [...sides].sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1));

describe("schachtSlice", () => {
    // Prüft, dass der Reducer ohne Aktion den korrekten Anfangszustand liefert.
    it("liefert den Anfangszustand", () => {
        const state = initState();
        expect(state).toEqual({ etagenMitSchacht: [] });
    });

    // addSchachtToEtage: Erzeugt einen neuen Eintrag für ein Stockwerk, wenn noch keiner existiert.
    it("addSchachtToEtage: erstellt neuen Eintrag, wenn keiner existiert", () => {
        const s1 = initState();
        const s2 = schachtReducer(s1, addSchachtToEtage({ etage: 1, side: "left" }));

        expect(s2.etagenMitSchacht).toHaveLength(1);
        expect(s2.etagenMitSchacht[0].etage).toBe(1);
        expect(sortSides(s2.etagenMitSchacht[0].sides)).toEqual(["left"]);
    });

    // addSchachtToEtage: Fügt die zweite Seite hinzu und verhindert Duplikate (maximal 2 Seiten pro Eintrag).
    it("addSchachtToEtage: fügt zweite Seite hinzu und verhindert Duplikate (max 2)", () => {
        const s1 = initState();
        const s2 = schachtReducer(s1, addSchachtToEtage({ etage: 2, side: "left" }));
        const s3 = schachtReducer(s2, addSchachtToEtage({ etage: 2, side: "right" }));
        const s4 = schachtReducer(s3, addSchachtToEtage({ etage: 2, side: "right" }));

        expect(s3.etagenMitSchacht).toHaveLength(1);
        expect(sortSides(s3.etagenMitSchacht[0].sides)).toEqual(["left", "right"]);
        expect(s4).toEqual(s3);
    });

    // addSchachtToEtage: Überschreitet das Limit von 2 Seiten nicht; weitere Hinzufügungen sind No-Op.
    it("addSchachtToEtage: überschreitet 2 Seiten nicht (No-Op bei mehr)", () => {
        const s1 = initState();
        const s2 = schachtReducer(s1, addSchachtToEtage({ etage: 3, side: "left" }));
        const s3 = schachtReducer(s2, addSchachtToEtage({ etage: 3, side: "right" }));
        const s4 = schachtReducer(s3, addSchachtToEtage({ etage: 3, side: "left" }));

        expect(sortSides(s3.etagenMitSchacht[0].sides)).toEqual(["left", "right"]);
        expect(s4).toEqual(s3);
    });

    // removeSchachtFromEtage: Entfernt eine bestimmte Seite und löscht den Eintrag, wenn keine Seite mehr übrig ist.
    it("removeSchachtFromEtage: entfernt Seite, löscht Eintrag bei letzter Seite", () => {
        const s1 = initState();
        const s2 = schachtReducer(s1, addSchachtToEtage({ etage: 5, side: "left" }));
        const s3 = schachtReducer(s2, addSchachtToEtage({ etage: 5, side: "right" }));

        const s4 = schachtReducer(s3, removeSchachtFromEtage({ etage: 5, side: "right" }));
        expect(s4.etagenMitSchacht).toHaveLength(1);
        expect(s4.etagenMitSchacht[0].etage).toBe(5);
        expect(sortSides(s4.etagenMitSchacht[0].sides)).toEqual(["left"]);

        const s5 = schachtReducer(s4, removeSchachtFromEtage({ etage: 5, side: "left" }));
        expect(s5.etagenMitSchacht).toEqual([]);
    });

    // removeSchachtFromEtage: No-Op, wenn das Stockwerk nicht existiert oder die Seite nicht gesetzt ist.
    it("removeSchachtFromEtage: No-Op bei fehlendem Stockwerk oder Seite", () => {
        const s1 = initState();
        const s2 = schachtReducer(s1, addSchachtToEtage({ etage: 7, side: "left" }));

        const s3 = schachtReducer(s2, removeSchachtFromEtage({ etage: 7, side: "right" }));
        expect(s3).toEqual(s2);

        const s4 = schachtReducer(s3, removeSchachtFromEtage({ etage: 99, side: "left" }));
        expect(s4).toEqual(s3);
    });

    // resetSchacht: Entnimmt die Sides je Eintrag als Menge (Duplikate entfernt) und sortiert die Einträge nach Etage.
    it("resetSchacht: dedupliziert Seiten und sortiert nach Etage", () => {
        const payload = {
            etagenMitSchacht: [
                { etage: 2, sides: ["right", "left", "left"] as Array<"left" | "right"> },
                { etage: 1, sides: ["left"] as Array<"left" | "right"> },
            ],
        };

        const s1 = initState();
        const s2 = schachtReducer(s1, resetSchacht(payload));

        expect(s2.etagenMitSchacht.map(e => e.etage)).toEqual([1, 2]);

        const e1 = s2.etagenMitSchacht.find(e => e.etage === 1)!;
        const e2 = s2.etagenMitSchacht.find(e => e.etage === 2)!;
        expect(sortSides(e1.sides)).toEqual(["left"]);
        expect(sortSides(e2.sides)).toEqual(["left", "right"]);
    });
});

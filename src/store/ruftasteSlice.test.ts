import ruftasteReducer, {
    addRuftasteToEtage,
    activateRuftaste,
    deactivateRuftaste,
    removeRuftastenForEtage,
    resetRuftasten,
} from "../store/ruftasteSlice";
import { describe, it, expect } from "vitest";

const initState = () => ruftasteReducer(undefined as any, { type: "@@INIT" } as any);

describe("ruftasteSlice", () => {
    // Prüft den Default-State ohne Aktionen.
    it("liefert den Anfangszustand", () => {
        const s = initState();
        expect(s).toEqual({ etagenMitRuftasten: [], aktiveRuftasten: [] });
    });

    // addRuftasteToEtage: fügt eine Etage einmalig hinzu (keine Duplikate).
    it("addRuftasteToEtage: fügt einmalig hinzu und verhindert Duplikate", () => {
        const s1 = initState();
        const s2 = ruftasteReducer(s1, addRuftasteToEtage(3));
        const s3 = ruftasteReducer(s2, addRuftasteToEtage(3));

        expect(s2.etagenMitRuftasten).toEqual([3]);
        expect(s3).toEqual(s2);
    });

    // activateRuftaste: aktiviert (etage, Richtung) nur einmal; Duplikate werden ignoriert.
    it("activateRuftaste: aktiviert Paar (etage, Richtung) ohne Duplikate", () => {
        const s1 = initState();
        const s2 = ruftasteReducer(s1, activateRuftaste({ etage: 2, callDirection: "up" }));
        const s3 = ruftasteReducer(s2, activateRuftaste({ etage: 2, callDirection: "up" }));
        const s4 = ruftasteReducer(s3, activateRuftaste({ etage: 2, callDirection: "down" }));

        expect(s2.aktiveRuftasten).toEqual([{ etage: 2, callDirection: "up" }]);
        expect(s3).toEqual(s2);
        expect(s4.aktiveRuftasten).toEqual([
            { etage: 2, callDirection: "up" },
            { etage: 2, callDirection: "down" },
        ]);
    });

    // deactivateRuftaste: entfernt ein aktives Paar; nicht vorhandene Kombination ist No-Op.
    it("deactivateRuftaste: entfernt Kombination oder ist No-Op", () => {
        const s1 = initState();
        const s2 = ruftasteReducer(s1, activateRuftaste({ etage: 5, callDirection: "down" }));
        const s3 = ruftasteReducer(s2, deactivateRuftaste({ etage: 5, callDirection: "down" }));
        expect(s3.aktiveRuftasten).toEqual([]);

        const s4 = ruftasteReducer(s3, deactivateRuftaste({ etage: 5, callDirection: "down" }));
        expect(s4).toEqual(s3);
    });

    // removeRuftastenForEtage: entfernt die Etage nur aus der Liste 'etagenMitRuftasten', aktive Einträge bleiben unberührt.
    it("removeRuftastenForEtage: beeinflusst nur etagenMitRuftasten, nicht aktiveRuftasten", () => {
        const s1 = initState();
        const s2 = ruftasteReducer(s1, addRuftasteToEtage(4));
        const s3 = ruftasteReducer(s2, activateRuftaste({ etage: 4, callDirection: "up" }));
        const s4 = ruftasteReducer(s3, removeRuftastenForEtage(4));

        expect(s4.etagenMitRuftasten).toEqual([]);
        expect(s4.aktiveRuftasten).toEqual([{ etage: 4, callDirection: "up" }]);
    });

    // resetRuftasten: sortiert Etagen aufsteigend; aktive Einträge nach Etage und dann up < down.
    it("resetRuftasten: sortiert Etagen und aktive Einträge (up vor down)", () => {
        const payload = {
            etagenMitRuftasten: [3, 1, 2, 2],
            aktiveRuftasten: [
                { etage: 2, callDirection: "down" },
                { etage: 1, callDirection: "down" },
                { etage: 2, callDirection: "up" },
                { etage: 1, callDirection: "up" },
            ],
        };

        const s1 = initState();
        //@ts-ignore
        const s2 = ruftasteReducer(s1, resetRuftasten(payload));

        // Etagen: aufsteigend sortiert, Duplikate bleiben erhalten, da nicht dedupliziert wird.
        expect(s2.etagenMitRuftasten).toEqual([1, 2, 2, 3]);

        // Aktive: gruppiert nach Etage, innerhalb Etage steht "up" vor "down".
        expect(s2.aktiveRuftasten).toEqual([
            { etage: 1, callDirection: "up" },
            { etage: 1, callDirection: "down" },
            { etage: 2, callDirection: "up" },
            { etage: 2, callDirection: "down" },
        ]);
    });

    // Aktivieren ohne vorherige Registrierung der Etage ist erlaubt (keine Validierung in Reducern).
    it("activateRuftaste ohne addRuftasteToEtage: erlaubt und wird gespeichert", () => {
        const s1 = initState();
        const s2 = ruftasteReducer(s1, activateRuftaste({ etage: 99, callDirection: "up" }));
        expect(s2.aktiveRuftasten).toEqual([{ etage: 99, callDirection: "up" }]);
    });
});

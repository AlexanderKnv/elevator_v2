/** @packageDocumentation
 * # Imperativ-Parser: Anzeige (`parseImperativAnzeigeCode`)
 *
 * - Parst Zeilen der Form `anzeige_left = [etage_1, ...]` und `anzeige_right = [etage_2, ...]` (case-insensitive).
 * - Entfernt `#`-Kommentare, extrahiert die Etagen als Tokens `etage_<n>` und validiert jeden Wert (`1..3`) ohne Duplikate je Seite.
 * - Sortiert die Etagen pro Seite aufsteigend und führt sie etagenweise zu Sides-Mengen zusammen.
 * - Ordnet Sides je Etage deterministisch (`left` vor `right`) und sortiert das Ergebnis nach Etagennummer.
 * - Gibt `{ etagenMitAnzeige }` zurück; wirft verständliche Fehler bei falschem Token-Format oder doppelten Einträgen.
 */

import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";
import type { AnzeigeSide, AnzeigeState } from "../../../../store/anzeigeSlice ";

export function parseImperativAnzeigeCode(code: string): AnzeigeState {
    const text = stripHashComments(code);

    const parseSide = (side: AnzeigeSide): number[] => {
        const re = new RegExp(`\\banzeige_${side}\\s*=\\s*\\[([^\\]]*)\\]`, "i");
        const m = text.match(re);
        if (!m) return [];

        const inner = m[1].trim();
        if (inner === "") return [];

        const parts = inner
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);

        const out: number[] = [];
        const seen = new Set<number>();
        for (const p of parts) {
            const mm = p.match(/^etage_(\d+)$/i);
            if (!mm) {
                throw new Error(
                    `anzeige_${side}: Ungültiger Eintrag "${p}" (erwartet etage_<n>).`
                );
            }
            const n = parseInt(mm[1], 10);
            checkEtageRange(n, `anzeige_${side}`);
            if (seen.has(n)) {
                throw new Error(`anzeige_${side}: doppelte Etage ${n}.`);
            }
            seen.add(n);
            out.push(n);
        }

        out.sort((a, b) => a - b);
        return out;
    };

    const left = parseSide("left");
    const right = parseSide("right");

    const byEtage = new Map<number, Set<AnzeigeSide>>();
    const add = (n: number, s: AnzeigeSide) => {
        if (!byEtage.has(n)) byEtage.set(n, new Set<AnzeigeSide>());
        byEtage.get(n)!.add(s);
    };

    left.forEach((n) => add(n, "left"));
    right.forEach((n) => add(n, "right"));

    const etagenMitAnzeige = Array.from(byEtage.entries())
        .map(([etage, set]) => ({
            etage,
            sides: Array.from(set).sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1)),
        }))
        .sort((a, b) => a.etage - b.etage);

    return { etagenMitAnzeige };
}

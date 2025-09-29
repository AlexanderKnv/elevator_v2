/** @packageDocumentation
 * # OOP-Parser: Anzeige (`parseOopAnzeigeCode`)
 *
 * - Entfernt `#`-Kommentare aus dem Eingabetext.
 * - Parst Zuweisungen im Format `anzeige_panel_<etage>_<side> = AnzeigePanel(etage_<etage>, "<side>")`.
 * - Prüft Konsistenz: Variablen-`<etage>` ≙ Argument-`etage_<…>` und Variablen-`<side>` ≙ Argument-`"<side>"`.
 * - Validiert den Etagenbereich (1–3) via `checkEtageRange`.
 * - Verhindert doppelte Seiten je Etage (z. B. zweimal `"left"`).
 * - Aggregiert zu `{ etage, sides }[]`, sortiert Sides deterministisch (`left` vor `right`) und das Ergebnis nach Etage.
 */

import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";
import type { AnzeigeSide, AnzeigeState } from "../../../../store/anzeigeSlice ";

export function parseOopAnzeigeCode(code: string): AnzeigeState {
    const text = stripHashComments(code);

    const re = /anzeige_panel_(\d+)_(left|right)\s*=\s*AnzeigePanel\(\s*etage_(\d+)\s*,\s*"(left|right)"\s*\)/g;

    const byEtage = new Map<number, Set<AnzeigeSide>>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const etageNumVar = parseInt(m[1], 10);
        const sideFromName = m[2] as AnzeigeSide;
        const etageNumArg = parseInt(m[3], 10);
        const sideFromArg = m[4] as AnzeigeSide;

        if (etageNumVar !== etageNumArg) {
            throw new Error(
                `AnzeigePanel für Etage ${etageNumVar}: Variablenname und Argument etage_<n> widersprechen sich.`
            );
        }
        if (sideFromName !== sideFromArg) {
            throw new Error(
                `AnzeigePanel für Etage ${etageNumVar}: Variablenname-Seite (${sideFromName}) und Argument-Seite (${sideFromArg}) widersprechen sich.`
            );
        }

        checkEtageRange(etageNumVar, "anzeige", etageNumVar);

        if (!byEtage.has(etageNumVar)) byEtage.set(etageNumVar, new Set());
        const set = byEtage.get(etageNumVar)!;
        if (set.has(sideFromName)) {
            throw new Error(
                `AnzeigePanel Etage ${etageNumVar}: doppelte Seite "${sideFromName}".`
            );
        }
        set.add(sideFromName);
    }

    const etagenMitAnzeige = Array.from(byEtage.entries())
        .map(([etage, sides]) => ({
            etage,
            sides: Array.from(sides).sort((a, b) =>
                a === b ? 0 : a === "left" ? -1 : 1
            ),
        }))
        .sort((a, b) => a.etage - b.etage);

    return { etagenMitAnzeige };
}

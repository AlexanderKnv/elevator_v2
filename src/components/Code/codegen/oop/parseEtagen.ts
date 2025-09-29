/** @packageDocumentation
 * # OOP-Parser: Etagen (`parseOopEtagenCode`)
 *
 * Parser für OOP-Stil-Zuweisungen von Etagen.
 *
 * - Entfernt `#`-Kommentare und filtert Zeilen, die mit `etage_` beginnen.
 * - Erwartet Format: `etage_<nr> = Etage(<nr>)`; prüft Konsistenz von Variablen- und Konstruktorwert.
 * - Validiert den Wertebereich **1–3** je Etage und verhindert Duplikate (Fehler bei Wiederholungen).
 * - Erzwingt eine Obergrenze von **maximal 3** Etagen (sonst Fehler).
 * - Gibt die erkannten Etagen **aufsteigend sortiert** als `number[]` zurück.
 */

import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseOopEtagenCode(code: string): number[] {
    const text = stripHashComments(code);

    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("etage_"));

    if (lines.length === 0) return [];

    const out: number[] = [];
    const seen = new Set<number>();

    lines.forEach((line, idx) => {
        const m = line.match(/^etage_(\d+)\s*=\s*Etage\s*\(\s*(\d+)\s*\)\s*$/);
        if (!m) {
            throw new Error(
                `Ungültige Etage in Zeile ${idx + 1}: "${line}". Erwartet: etage_<nr> = Etage(<nr>).`
            );
        }

        const varNum = parseInt(m[1], 10);
        const ctorNum = parseInt(m[2], 10);

        if (varNum !== ctorNum) {
            throw new Error(
                `Ungültige Etage: "etage_${varNum} = Etage(${ctorNum})". Erwartet: etage_${varNum} = Etage(${varNum}).`
            );
        }

        checkEtageRange(ctorNum, "nr");

        if (seen.has(ctorNum)) {
            throw new Error(`Doppelte Etage gefunden: "${ctorNum}".`);
        }
        seen.add(ctorNum);
        out.push(ctorNum);
    });

    if (out.length > 3) {
        throw new Error(`Zu viele Etagen definiert (${out.length}). Maximal sind 3 erlaubt.`);
    }

    return out.sort((a, b) => a - b);
}

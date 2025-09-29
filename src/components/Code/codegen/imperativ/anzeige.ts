/** @packageDocumentation
 * # Imperativ-Generator: Anzeige (`generateImperativAnzeigeCode`)
 *
 * - Aggregiert Etagen pro Seite aus `state.etagenMitAnzeige` in zwei Mengen: **left** und **right** (ohne Duplikate).
 * - Sortiert beide Etagenlisten aufsteigend.
 * - Gibt `""` zurück, wenn beide Listen leer sind.
 * - Formatiert die Ausgabe im Imperativ-/Variablenstil:
 *   - Verwendet `etage_<n>` via `etageVar(n)` und Arrays wie `[etage_1, etage_3]` bzw. `[]`.
 * - Erzeugt zwei Zeilen:
 *   - `anzeige_left  = [...]`
 *   - `anzeige_right = [...]`
 */

import { etageVar } from "../../../../helpers/renderHelper";
import type { AnzeigeState } from "../../../../store/anzeigeSlice ";

export function generateImperativAnzeigeCode(state: AnzeigeState): string {
    const bySide = { left: new Set<number>(), right: new Set<number>() } as const;

    for (const entry of state?.etagenMitAnzeige ?? []) {
        for (const s of entry.sides ?? []) {
            if (s === "left" || s === "right") bySide[s].add(entry.etage);
        }
    }

    const left = Array.from(bySide.left).sort((a, b) => a - b);
    const right = Array.from(bySide.right).sort((a, b) => a - b);

    if (left.length === 0 && right.length === 0) return "";

    const fmt = (arr: number[]) =>
        arr.length ? `[${arr.map(etageVar).join(", ")}]` : "[]";

    const lines: string[] = [];
    lines.push(`anzeige_left  = ${fmt(left)}`);
    lines.push(`anzeige_right = ${fmt(right)}`);

    return lines.join("\n");
}

/** @packageDocumentation
 * # Imperativ-Generator: Schacht (`generateImperativSchachtCode`)
 *
 * - Aggregiert Etagen pro Seite aus `state.etagenMitSchacht` in zwei Mengen (**left**, **right**) ohne Duplikate.
 * - Sortiert beide Etagenlisten aufsteigend; gibt `""` zurück, wenn beide leer sind.
 * - Formatiert die Ausgabe im Imperativ-/Variablenstil:
 *   `schacht_left  = [etage_1, etage_3]` und `schacht_right = [etage_2]` (oder `[]`).
 * - Verwendet `etageVar(n)` zur Darstellung als `etage_<n>`; liefert genau zwei Zeilen, getrennt durch `\n`.
 * - Robust gegen `null/undefined` durch Fallback `state?.etagenMitSchacht ?? []`.
 */

import { etageVar } from "../../../../helpers/renderHelper";
import type { SchachtState } from "../../../../store/schachtSlice";

export function generateImperativSchachtCode(state: SchachtState): string {
    const bySide = { left: new Set<number>(), right: new Set<number>() } as const;

    for (const entry of state?.etagenMitSchacht ?? []) {
        for (const s of entry.sides ?? []) {
            if (s === "left" || s === "right") bySide[s].add(entry.etage);
        }
    }

    const left = Array.from(bySide.left).sort((a, b) => a - b);
    const right = Array.from(bySide.right).sort((a, b) => a - b);

    if (left.length === 0 && right.length === 0) return "";

    const fmt = (arr: number[]) => (arr.length ? `[${arr.map(etageVar).join(", ")}]` : "[]");

    return [
        `schacht_left  = ${fmt(left)}`,
        `schacht_right = ${fmt(right)}`,
    ].join("\n");
}

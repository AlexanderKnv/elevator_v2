/** @packageDocumentation
 * # Deklarativ-Generator: Schacht (`generateDeklarativSchachtCode`)
 *
 * - Nimmt `SchachtState` entgegen und erzeugt einen JSON-ähnlichen Block `schacht = [ { "etage": <n>, "sides": ["left","right"] }, ... ]`.
 * - Sortiert Einträge aufsteigend nach `etage`.
 * - Entdoppelt `sides` je Etage und ordnet deterministisch: `"left"` vor `"right"`.
 * - Repräsentiert fehlende Seiten als leeres Array `[]`.
 * - Gibt `""` (Leerstring) zurück, wenn keine Einträge vorhanden sind; robust gegen `null/undefined` durch Fallback `state?.etagenMitSchacht ?? []`.
 */

import type { SchachtState, SchachtSide } from "../../../../store/schachtSlice";

export function generateDeklarativSchachtCode(state: SchachtState): string {
    const rows = [...(state?.etagenMitSchacht ?? [])]
        .sort((a, b) => a.etage - b.etage)
        .map(({ etage, sides }) => {
            const uniq = Array.from(new Set(sides ?? [])) as SchachtSide[];
            const ordered = uniq.sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1));
            const sidesStr = ordered.length ? `["${ordered.join('", "')}"]` : "[]";
            return `    { "etage": ${etage}, "sides": ${sidesStr} }`;
        });

    if (rows.length === 0) return "";
    return `schacht = [\n${rows.join(",\n\n")}\n]`;
}

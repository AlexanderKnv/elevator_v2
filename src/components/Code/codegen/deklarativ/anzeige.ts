/** @packageDocumentation
 * # Deklarativ-Generator: Anzeige (`generateDeklarativAnzeigeCode`)
 *
 * - Erzeugt einen JSON-ähnlichen String im Format `anzeige = [ { "etage": <n>, "sides": ["left", "right"] }, ... ]`.
 * - Sortiert alle Einträge aufsteigend nach `etage`.
 * - Entdoppelt `sides` je Etage und ordnet deterministisch: `"left"` vor `"right"`.
 * - Repräsentiert fehlende Seiten als leeres Array `[]`.
 * - Gibt Leerstring zurück, wenn keine Einträge vorhanden sind.
 */

import type { AnzeigeSide, AnzeigeState } from "../../../../store/anzeigeSlice ";

export function generateDeklarativAnzeigeCode(
    state: AnzeigeState
): string {
    const rows = [...(state?.etagenMitAnzeige ?? [])]
        .sort((a, b) => a.etage - b.etage)
        .map(({ etage, sides }) => {
            const uniqSides = Array.from(new Set(sides ?? [])) as AnzeigeSide[];
            const ordered = uniqSides.sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1));
            const sidesStr =
                ordered.length ? `["${ordered.join('", "')}"]` : "[]";

            return [
                `    { "etage": ${etage}, "sides": ${sidesStr} }`
            ].join("\n");
        });

    if (rows.length === 0) return "";

    return `anzeige = [\n${rows.join(",\n\n")}\n]`;
}
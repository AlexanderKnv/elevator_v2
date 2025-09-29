/** @packageDocumentation
 * # Deklarativ-Generator: Ruftasten (`generateDeklarativRuftasteCode`)
 *
 * - Gibt `""` zurück, wenn sowohl `etagenMitRuftasten` als auch `aktiveRuftasten` leer sind.
 * - Entdoppelt und sortiert `etagenMitRuftasten` aufsteigend (robust gegen `null/undefined`).
 * - Normalisiert `aktiveRuftasten` und sortiert deterministisch: zuerst nach Etage, dann `'up'` vor `'down'`.
 * - Erzeugt einen JSON-ähnlichen Block:
 *   ```
 *   ruftasten = {
 *     "etagenMitRuftasten": [ { "etage": <n> }, ... ],
 *     "aktiveRuftasten":    [ { "etage": <n>, "call_direction": "up"|"down" }, ... ]
 *   }
 *   ```
 */

import type { Richtung } from "../../../../store/ruftasteSlice";

export function generateDeklarativRuftasteCode(
    etagenMitRuftasten: number[],
    aktiveRuftasten: { etage: number; callDirection: Richtung }[]
): string {
    const etagen = Array.from(new Set(etagenMitRuftasten ?? [])).sort((a, b) => a - b);
    const active = [...(aktiveRuftasten ?? [])]
        .map(a => ({ etage: a.etage, callDirection: a.callDirection }))
        .sort((a, b) => (a.etage - b.etage) || (a.callDirection === "up" && b.callDirection === "down" ? -1 : a.callDirection === b.callDirection ? 0 : 1));

    if (etagen.length === 0 && active.length === 0) return "";

    const etagenLines = etagen.map(nr => `        { "etage": ${nr} }`).join(",\n");
    const aktiveLines = active
        .map(e => `        { "etage": ${e.etage}, "call_direction": "${e.callDirection}" }`)
        .join(",\n");

    return [
        `ruftasten = {`,
        `    "etagenMitRuftasten": [`,
        etagenLines || ``,
        `    ],`,
        `    "aktiveRuftasten": [`,
        aktiveLines || ``,
        `    ]`,
        `}`,
    ].join("\n");
}

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
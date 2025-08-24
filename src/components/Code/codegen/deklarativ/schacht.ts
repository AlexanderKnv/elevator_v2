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

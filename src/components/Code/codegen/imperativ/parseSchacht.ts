import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";
import type { SchachtState, SchachtSide } from "../../../../store/schachtSlice";

export function parseImperativSchachtCode(code: string): SchachtState {
    const text = stripHashComments(code);

    const parseSide = (side: SchachtSide): number[] => {
        const re = new RegExp(`\\bschacht_${side}\\s*=\\s*\\[([^\\]]*)\\]`, "i");
        const m = text.match(re);
        if (!m) return [];

        const inner = m[1].trim();
        if (inner === "") return [];

        const parts = inner.split(",").map((p) => p.trim()).filter(Boolean);

        const out: number[] = [];
        const seen = new Set<number>();
        for (const p of parts) {
            const mm = p.match(/^etage_(\d+)$/i);
            if (!mm) {
                throw new Error(`schacht_${side}: Ungültiger Eintrag "${p}" (erwartet etage_<n>).`);
            }
            const n = parseInt(mm[1], 10);
            checkEtageRange(n, `schacht_${side}`);
            if (seen.has(n)) throw new Error(`schacht_${side}: doppelte Etage ${n}.`);
            seen.add(n);
            out.push(n);
        }

        out.sort((a, b) => a - b);
        return out;
    };

    const left = parseSide("left");
    const right = parseSide("right");

    const byEtage = new Map<number, Set<SchachtSide>>();
    const add = (n: number, s: SchachtSide) => {
        if (!byEtage.has(n)) byEtage.set(n, new Set<SchachtSide>());
        byEtage.get(n)!.add(s);
    };

    left.forEach((n) => add(n, "left"));
    right.forEach((n) => add(n, "right"));

    const etagenMitSchacht = Array.from(byEtage.entries())
        .map(([etage, sides]) => ({
            etage,
            sides: Array.from(sides).sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1)),
        }))
        .sort((a, b) => a.etage - b.etage);

    return { etagenMitSchacht };
}

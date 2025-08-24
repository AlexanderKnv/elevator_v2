import { normalizePyBooleansNone, splitTopLevelObjects, stripHashComments, stripTrailingCommas, tryExtractBracketInner } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";
import type { SchachtState, SchachtSide } from "../../../../store/schachtSlice";

export function parseDeklarativSchachtCode(code: string): SchachtState {
    const base = stripTrailingCommas(normalizePyBooleansNone(stripHashComments(code)));

    const inner = tryExtractBracketInner(base, /schacht\s*=\s*\[/s, "[", "]");
    if (inner == null) return { etagenMitSchacht: [] };

    const body = inner.trim();
    if (body === "") return { etagenMitSchacht: [] };

    const objs = splitTopLevelObjects(body);
    if (objs.length === 0) throw new Error(`"schacht"-Block ist leer oder enthält keine Objekte.`);

    const seenEtagen = new Set<number>();
    const result: SchachtState["etagenMitSchacht"] = [];

    objs.forEach((obj, i) => {
        const idx = i + 1;

        const mEt = obj.match(/"etage"\s*:\s*(-?\d+)/);
        if (!mEt) throw new Error(`Schacht #${idx}: Feld "etage" fehlt oder ist ungültig (Zahl erwartet).`);
        const etage = parseInt(mEt[1], 10);
        checkEtageRange(etage, "etage", idx);
        if (seenEtagen.has(etage)) throw new Error(`Schacht: doppelte Etage ${etage}.`);
        seenEtagen.add(etage);

        const mSides = obj.match(/"sides"\s*:\s*\[([\s\S]*?)\]/);
        if (!mSides) throw new Error(`Schacht #${idx}: Feld "sides" fehlt oder ist ungültig (Liste erwartet).`);

        const innerSides = mSides[1].trim();
        const sides: SchachtSide[] = innerSides === ""
            ? []
            : innerSides.split(",").map(p => p.trim()).map(p => {
                const m = p.match(/^"(left|right)"$/);
                if (!m) throw new Error(`Schacht #${idx}: "sides" enthält ungültigen Eintrag ${p}. Erlaubt sind "left"|"right".`);
                return m[1] as SchachtSide;
            });

        const uniqSides = Array.from(new Set(sides));
        if (uniqSides.length !== sides.length) throw new Error(`Schacht #${idx}: "sides" enthält Duplikate.`);
        if (uniqSides.length > 2) throw new Error(`Schacht #${idx}: "sides" darf höchstens 2 Einträge haben.`);

        uniqSides.sort((a, b) => (a === b ? 0 : a === "left" ? -1 : 1));
        result.push({ etage, sides: uniqSides });
    });

    result.sort((a, b) => a.etage - b.etage);
    return { etagenMitSchacht: result };
}

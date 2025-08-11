import type { Richtung } from "../../../../store/ruftasteSlice";
import {
    extractBracketInner,
    splitTopLevelObjects,
    stripHashComments,
    normalizePyBooleansNone,
    stripTrailingCommas,
} from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseDeklarativRuftasteCode(code: string): {
    etagenMitRuftasten: number[];
    aktiveRuftasten: { etage: number; callDirection: Richtung }[];
} {
    const base = stripTrailingCommas(
        normalizePyBooleansNone(
            stripHashComments(code)
        )
    );

    if (!/ruftasten\s*=\s*\{/s.test(base)) {
        return { etagenMitRuftasten: [], aktiveRuftasten: [] };
    }

    const ruftastenInner = extractBracketInner(base, /ruftasten\s*=\s*\{/s, "{", "}")
        .trim();

    let etagenMitRuftasten: number[] = [];
    const hasEtagenBlock = /"etagenMitRuftasten"\s*:\s*\[/s.test(ruftastenInner);
    if (hasEtagenBlock) {
        const inner = extractBracketInner(ruftastenInner, /"etagenMitRuftasten"\s*:\s*\[/s, "[", "]").trim();
        if (inner !== "") {
            const objs = splitTopLevelObjects(inner);
            const seen = new Set<number>();
            etagenMitRuftasten = objs.map((obj, i) => {
                const idx = i + 1;
                const m = obj.match(/"etage"\s*:\s*(-?\d+)/);
                if (!m) throw new Error(`etagenMitRuftasten #${idx}: Feld "etage" fehlt oder ist ungültig (Zahl erwartet).`);
                const nr = parseInt(m[1], 10);
                checkEtageRange(nr, "etage"); // 1..3
                if (seen.has(nr)) throw new Error(`etagenMitRuftasten: doppelte Etage ${nr}.`);
                seen.add(nr);
                return nr;
            });
            etagenMitRuftasten.sort((a, b) => a - b);
        }
    }

    let aktiveRuftasten: { etage: number; callDirection: Richtung }[] = [];
    const hasAktiveBlock = /"aktiveRuftasten"\s*:\s*\[/s.test(ruftastenInner);
    if (hasAktiveBlock) {
        const inner = extractBracketInner(ruftastenInner, /"aktiveRuftasten"\s*:\s*\[/s, "[", "]").trim();
        if (inner !== "") {
            const objs = splitTopLevelObjects(inner);
            const seenPairs = new Set<string>();
            aktiveRuftasten = objs.map((obj, i) => {
                const idx = i + 1;

                const mEtage = obj.match(/"etage"\s*:\s*(-?\d+)/);
                if (!mEtage) throw new Error(`aktiveRuftasten #${idx}: Feld "etage" fehlt oder ist ungültig (Zahl erwartet).`);
                const etage = parseInt(mEtage[1], 10);
                checkEtageRange(etage, "etage");

                const mDir = obj.match(/"call_direction"\s*:\s*"(up|down)"/);
                if (!mDir) throw new Error(`aktiveRuftasten #${idx}: Feld "call_direction" muss "up" oder "down" sein.`);
                const callDirection = mDir[1] as Richtung;

                const key = `${etage}|${callDirection}`;
                if (seenPairs.has(key)) {
                    throw new Error(`aktiveRuftasten: doppelter Eintrag für Etage ${etage} und Richtung "${callDirection}".`);
                }
                seenPairs.add(key);

                return { etage, callDirection };
            });

            aktiveRuftasten.sort((a, b) => (a.etage - b.etage) || (a.callDirection === "up" && b.callDirection === "down" ? -1 : a.callDirection === b.callDirection ? 0 : 1));
        }
    }

    return { etagenMitRuftasten, aktiveRuftasten };
}

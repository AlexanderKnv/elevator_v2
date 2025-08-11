import type { Richtung } from "../../../../store/ruftasteSlice";
import { stripHashComments, extractBracketInner, splitTopLevelObjects } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseImperativRuftasteCode(code: string): {
    etagenMitRuftasten: number[];
    aktiveRuftasten: { etage: number; callDirection: Richtung }[];
} {
    const text = stripHashComments(code);

    let etagenMitRuftasten: number[] = [];
    if (/ruftasten_etagen\s*=/.test(text)) {
        const inner = extractBracketInner(text, /ruftasten_etagen\s*=\s*\[/s, "[", "]").trim();
        if (inner) {
            const parts = inner.split(",").map(s => s.trim()).filter(Boolean);
            const etageVarRe = /^etage_(\d+)$/i;
            const seen = new Set<number>();
            etagenMitRuftasten = parts.map((p, idx) => {
                const m = p.match(etageVarRe);
                if (!m) throw new Error(`ruftasten_etagen: Ungültiger Eintrag "${p}" (erwartet etage_<n>).`);
                const n = parseInt(m[1], 10);
                checkEtageRange(n, "etage");
                if (seen.has(n)) throw new Error(`ruftasten_etagen: doppelte Etage ${n}.`);
                seen.add(n);
                return n;
            });
            etagenMitRuftasten.sort((a, b) => a - b);
        }
    }

    let aktiveRuftasten: { etage: number; callDirection: Richtung }[] = [];
    if (/aktive_ruftasten\s*=\s*\[/s.test(text)) {
        const inner = extractBracketInner(text, /aktive_ruftasten\s*=\s*\[/s, "[", "]").trim();
        if (inner) {
            const objs = splitTopLevelObjects(inner);
            if (objs.length === 0) {
                throw new Error(`"aktive_ruftasten"-Block ist leer oder enthält keine Objekte.`);
            }
            const etageVarRe = /^etage_(\d+)$/i;
            const seenPairs = new Set<string>();

            aktiveRuftasten = objs.map((obj, i) => {
                const idx = i + 1;

                const mEtage = obj.match(/"etage"\s*:\s*(etage_\d+)/i);
                if (!mEtage) throw new Error(`aktive_ruftasten #${idx}: Feld "etage" muss etage_<n> sein.`);
                const mNum = mEtage[1].match(etageVarRe)!;
                const etage = parseInt(mNum[1], 10);
                checkEtageRange(etage, "etage");

                const mDir = obj.match(/"call_direction"\s*:\s*"(up|down)"/i);
                if (!mDir) throw new Error(`aktive_ruftasten #${idx}: Feld "call_direction" muss "up" oder "down" sein.`);
                const callDirection = mDir[1].toLowerCase() as Richtung;

                const key = `${etage}|${callDirection}`;
                if (seenPairs.has(key)) {
                    throw new Error(`aktive_ruftasten: doppelter Eintrag für Etage ${etage} und Richtung "${callDirection}".`);
                }
                seenPairs.add(key);

                return { etage, callDirection };
            });

            aktiveRuftasten.sort(
                (a, b) =>
                    a.etage - b.etage ||
                    (a.callDirection === "up" && b.callDirection === "down" ? -1 :
                        a.callDirection === b.callDirection ? 0 : 1)
            );
        }
    }

    return { etagenMitRuftasten, aktiveRuftasten };
}

import type { Kabine } from "../../../../store/kabineSlice";
import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange, ensureTargetNotEqualCurrent, ensureDirectionConsistent } from "../../../../helpers/validationHelper";
import { toKabineState } from "../../../../helpers/kabineHelper";

export function parseImperativKabinenCode(code: string): Kabine[] {
    const text = stripHashComments(code);
    const lines = text.split("\n");

    type Acc = Record<string, Record<string, string>>;
    const acc: Acc = {};
    const assignRe = /^\s*kabine_(\d+)_([a-z_]+)\s*=\s*(.+?)\s*$/;

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        const m = line.match(assignRe);
        if (!m) continue;

        const [, idStr, key, val] = m;
        (acc[idStr] ||= {})[key] = val.trim();
    }

    const ids = Object.keys(acc)
        .map((s) => parseInt(s, 10))
        .sort((a, b) => a - b);

    if (ids.length === 0) return [];

    const etageVarRe = /^etage_(\d+)$/i;

    const parseIntStrict = (src: string, label: string, kabIdx: number): number => {
        const m = src.match(/^-?\d+$/);
        if (!m) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss eine ganze Zahl sein.`);
        return parseInt(src, 10);
    };

    const parseEtageVar = (src: string, label: string, kabIdx: number): number => {
        const m = src.match(etageVarRe);
        if (!m) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss etage_<n> sein.`);
        const n = parseInt(m[1], 10);
        checkEtageRange(n, label, kabIdx);
        return n;
    };

    const parseEtageVarOrNone = (src: string, label: string, kabIdx: number): number | null => {
        if (/^None$/i.test(src)) return null;
        return parseEtageVar(src, label, kabIdx);
    };

    const parseEtageVarArray = (src: string, label: string, kabIdx: number): number[] => {
        const m = src.match(/^\[\s*(.*?)\s*\]$/);
        if (!m) {
            throw new Error(
                `Kabine #${kabIdx}: Feld "${label}" muss eine Liste von etage_<n> sein, z.B. [etage_1, etage_3].`
            );
        }
        const body = m[1].trim();
        if (!body) return [];
        return body.split(",").map((s) => parseEtageVar(s.trim(), label, kabIdx));
    };

    const parseBoolPy = (src: string, label: string, kabIdx: number): boolean => {
        if (/^True$/i.test(src)) return true;
        if (/^False$/i.test(src)) return false;
        throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss True|False sein.`);
    };

    const parseDir = (src: string, label: string, kabIdx: number): "up" | "down" | null => {
        if (/^None$/i.test(src)) return null;
        const m = src.match(/^"(up|down)"$/);
        if (!m) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss "up"|"down"|None sein.`);
        return m[1] as "up" | "down";
    };

    const out: Kabine[] = [];

    ids.forEach((idNum) => {
        const obj = acc[String(idNum)];
        const kabIdx = idNum;

        if (obj["id"] === undefined) throw new Error(`Kabine #${kabIdx}: Feld "id" fehlt.`);
        const idVal = parseIntStrict(obj["id"], "id", kabIdx);
        if (idVal !== idNum)
            throw new Error(`Kabine #${kabIdx}: "id" muss ${idNum} sein (gemäß Variablennamen).`);

        if (obj["current_etage"] === undefined)
            throw new Error(`Kabine #${kabIdx}: Feld "current_etage" fehlt.`);
        const currentEtage = parseEtageVar(obj["current_etage"], "current_etage", kabIdx);

        let targetEtage: number | null = null;
        if (obj["target_etage"] !== undefined) {
            targetEtage = parseEtageVarOrNone(obj["target_etage"], "target_etage", kabIdx);
            ensureTargetNotEqualCurrent(targetEtage, currentEtage, kabIdx);
        }

        const isMoving =
            obj["is_moving"] !== undefined
                ? parseBoolPy(obj["is_moving"], "is_moving", kabIdx)
                : false;

        const tuerOffen =
            obj["tuer_offen"] !== undefined
                ? parseBoolPy(obj["tuer_offen"], "tuer_offen", kabIdx)
                : false;

        const hasBedienpanel =
            obj["has_bedienpanel"] !== undefined
                ? parseBoolPy(obj["has_bedienpanel"], "has_bedienpanel", kabIdx)
                : false;

        const directionMovement =
            obj["direction_movement"] !== undefined
                ? parseDir(obj["direction_movement"], "direction_movement", kabIdx)
                : null;

        let callQueue: number[] = [];
        if (obj["call_queue"] !== undefined) {
            callQueue = parseEtageVarArray(obj["call_queue"], "call_queue", kabIdx);
        }

        let aktiveZielEtagen: number[] = [];
        if (obj["aktive_ziel_etagen"] !== undefined) {
            aktiveZielEtagen = parseEtageVarArray(
                obj["aktive_ziel_etagen"],
                "aktive_ziel_etagen",
                kabIdx
            );
        }

        ensureDirectionConsistent(directionMovement, currentEtage, targetEtage, kabIdx);

        out.push(
            toKabineState({
                idNum,
                currentEtage,
                targetEtage,
                isMoving,
                doorsOpen: tuerOffen,
                callQueue,
                directionMovement,
                hasBedienpanel,
                aktiveZielEtagen,
            })
        );
    });

    return out;
}
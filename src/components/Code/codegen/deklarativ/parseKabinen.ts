import type { Kabine } from "../../../../store/kabineSlice";
import { extractBracketInner, normalizePyBooleansNone, stripHashComments, stripTrailingCommas, splitTopLevelObjects } from "../../../../helpers/parsingHelper";
import { checkEtageRange, ensureDirectionConsistent, ensureTargetNotEqualCurrent } from "../../../../helpers/validationHelper";
import { toKabineState } from "../../../../helpers/kabineHelper";

export function parseDeklarativKabinenCode(code: string): Kabine[] {
    let inner = extractBracketInner(code, /kabinen\s*=\s*\[/s);
    inner = stripHashComments(inner);
    inner = normalizePyBooleansNone(inner);
    inner = stripTrailingCommas(inner).trim();

    if (inner === "") return [];

    const objects = splitTopLevelObjects(inner);
    if (objects.length === 0) throw new Error(`"kabinen"-Block ist leer oder enthält keine Objekte.`);

    const hasKey = (s: string, key: string) => new RegExp(`"${key}"\\s*:`).test(s);
    const readInt = (s: string, key: string, label: string, idx: number) => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahl erwartet).`);
        return parseInt(m[1], 10);
    };
    const readNumOrNull = (s: string, key: string, label: string, idx: number) => {
        if (!hasKey(s, key)) return null;
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss Zahl oder null sein.`);
        return m[1] === "null" ? null : parseInt(m[1], 10);
    };
    const readBool = (s: string, key: string, label: string, idx: number) => {
        if (!hasKey(s, key)) return null;
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(true|false)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss true|false sein.`);
        return m[1] === "true";
    };
    const readEnum = (s: string, key: string, label: string, idx: number) => {
        if (!hasKey(s, key)) return null;
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(?:"(up|down)"|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss "up"|"down"|null sein.`);
        return (m[1] as "up" | "down") ?? null;
    };
    const readNumArray = (s: string, key: string, label: string, idx: number) => {
        if (!hasKey(s, key)) return [];
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss ein Zahlen-Array sein.`);
        const body = m[1].trim();
        if (!body) return [];
        return body.split(",").map((p) => {
            const n = parseInt(p.trim(), 10);
            if (!Number.isInteger(n)) throw new Error(`Kabine #${idx}: "${label}" enthält ungültigen Wert "${p}".`);
            return n;
        });
    };

    const kabinen: Kabine[] = [];
    const seen = new Set<number>();

    objects.forEach((obj, i) => {
        const idx = i + 1;

        const idNum = readInt(obj, "id", "id", idx);
        if (idNum <= 0) throw new Error(`Kabine #${idx}: "id" muss > 0 sein.`);
        if (seen.has(idNum)) throw new Error(`Kabine #${idx}: doppelte "id" (${idNum}).`);
        seen.add(idNum);

        const currentEtage = readInt(obj, "current_etage", "current_etage", idx);
        checkEtageRange(currentEtage, "current_etage", idx);

        const targetEtage = readNumOrNull(obj, "target_etage", "target_etage", idx);
        if (targetEtage !== null) { checkEtageRange(targetEtage, "target_etage", idx); }
        ensureTargetNotEqualCurrent(targetEtage, currentEtage, idx);

        const isMoving = readBool(obj, "is_moving", "is_moving", idx) ?? false;
        const doorsOpen = readBool(obj, "tuer_offen", "tuer_offen", idx) ?? false;

        const callQueue = readNumArray(obj, "call_queue", "call_queue", idx);
        callQueue.forEach((v) => checkEtageRange(v, "call_queue", idx));

        const directionMovement = readEnum(obj, "direction_movement", "direction_movement", idx);
        const hasBedienpanel = readBool(obj, "has_bedienpanel", "has_bedienpanel", idx) ?? false;

        const aktiveZielEtagen = readNumArray(obj, "aktive_ziel_etagen", "aktive_ziel_etagen", idx);
        aktiveZielEtagen.forEach((v) => checkEtageRange(v, "aktive_ziel_etagen", idx));

        ensureDirectionConsistent(directionMovement, currentEtage, targetEtage, idx);

        kabinen.push(
            toKabineState({
                idNum,
                currentEtage,
                targetEtage,
                isMoving,
                doorsOpen,
                callQueue,
                directionMovement: directionMovement ?? null,
                hasBedienpanel,
                aktiveZielEtagen,
            })
        );
    });

    return kabinen;
}

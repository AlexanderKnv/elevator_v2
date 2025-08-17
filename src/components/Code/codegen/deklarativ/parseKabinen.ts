import type { Kabine } from "../../../../store/kabineSlice";
import { tryExtractBracketInner, normalizePyBooleansNone, stripHashComments, stripTrailingCommas, splitTopLevelObjects } from "../../../../helpers/parsingHelper";
import { checkEtageRange, ensureDirectionConsistent, ensureTargetNotEqualCurrent } from "../../../../helpers/validationHelper";
import { toKabineState } from "../../../../helpers/kabineHelper";

export function parseDeklarativKabinenCode(code: string): Kabine[] {
    // 0) нормализация текста
    const base = stripTrailingCommas(normalizePyBooleansNone(stripHashComments(code)));

    // 1) безопасно вытащить внутренность блока; если блока нет — пустой список
    const inner = tryExtractBracketInner(base, /kabinen\s*=\s*\[/s, "[", "]");
    if (inner == null) return [];

    const trimmed = inner.trim();
    if (trimmed === "") return []; // пустой список — тоже ок

    // 2) разрезаем верхнеуровневые объекты
    const objects = splitTopLevelObjects(trimmed);
    if (objects.length === 0) {
        throw new Error(`"kabinen"-Block ist leer oder enthält keine Objekte.`);
    }

    const readInt = (s: string, key: string, label: string, idx: number): number => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahl erwartet).`);
        return parseInt(m[1], 10);
    };

    const readNumOrNull_required = (s: string, key: string, label: string, idx: number): number | null => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahl oder null erwartet).`);
        return m[1] === "null" ? null : parseInt(m[1], 10);
    };

    const readBool_required = (s: string, key: string, label: string, idx: number): boolean => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(true|false)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (true|false erwartet).`);
        return m[1] === "true";
    };

    const readEnumUpDownNull_required = (
        s: string,
        key: string,
        label: string,
        idx: number
    ): "up" | "down" | null => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(?:"(up|down)"|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig ("up"|"down"|null erwartet).`);
        return (m[1] as "up" | "down") ?? null;
    };

    const readNumArray_required = (s: string, key: string, label: string, idx: number): number[] => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahlen-Array erwartet).`);
        const body = m[1].trim();
        if (!body) return [];
        return body.split(",").map((p) => {
            const t = p.trim();
            const n = parseInt(t, 10);
            if (!Number.isInteger(n)) {
                throw new Error(`Kabine #${idx}: "${label}" enthält ungültigen Wert "${t}".`);
            }
            return n;
        });
    };

    const kabinen: Kabine[] = [];
    const seenIds = new Set<number>();

    objects.forEach((obj, i) => {
        const idx = i + 1;

        // id (обяз.)
        const idNum = readInt(obj, "id", "id", idx);
        if (idNum <= 0) throw new Error(`Kabine #${idx}: "id" muss > 0 sein.`);
        if (seenIds.has(idNum)) throw new Error(`Kabine #${idx}: doppelte "id" (${idNum}).`);
        seenIds.add(idNum);

        // current_etage (обяз., 1..3)
        const currentEtage = readInt(obj, "current_etage", "current_etage", idx);
        checkEtageRange(currentEtage, "current_etage", idx);

        // target_etage (обяз., Zahl|null, если Zahl — 1..3, и не равен current)
        const targetEtage = readNumOrNull_required(obj, "target_etage", "target_etage", idx);
        if (targetEtage !== null) checkEtageRange(targetEtage, "target_etage", idx);
        ensureTargetNotEqualCurrent(targetEtage, currentEtage, idx);

        // is_moving (обяз.)
        const isMoving = readBool_required(obj, "is_moving", "is_moving", idx);

        // tuer_offen (обяз.)
        const doorsOpen = readBool_required(obj, "tuer_offen", "tuer_offen", idx);

        // call_queue (обяз., массив 1..3)
        const callQueue = readNumArray_required(obj, "call_queue", "call_queue", idx);
        callQueue.forEach((n) => checkEtageRange(n, "call_queue", idx));

        // direction_movement (обяз., "up"|"down"|null) + согласованность с current/target
        const directionMovement = readEnumUpDownNull_required(
            obj,
            "direction_movement",
            "direction_movement",
            idx
        );
        ensureDirectionConsistent(directionMovement, currentEtage, targetEtage, idx);

        // has_bedienpanel (обяз.)
        const hasBedienpanel = readBool_required(obj, "has_bedienpanel", "has_bedienpanel", idx);

        // aktive_ziel_etagen (обяз., массив 1..3)
        const aktiveZielEtagen = readNumArray_required(obj, "aktive_ziel_etagen", "aktive_ziel_etagen", idx);
        aktiveZielEtagen.forEach((n) => checkEtageRange(n, "aktive_ziel_etagen", idx));

        // собрать Kabine (doorsState будет выведен из tuer_offen)
        kabinen.push(
            toKabineState({
                idNum,
                currentEtage,
                targetEtage,
                isMoving,
                doorsOpen,
                callQueue,
                directionMovement,
                hasBedienpanel,
                aktiveZielEtagen,
            })
        );
    });

    return kabinen;
}
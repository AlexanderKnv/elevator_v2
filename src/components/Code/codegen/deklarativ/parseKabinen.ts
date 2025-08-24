import type { Kabine, KabineSide } from "../../../../store/kabineSlice";
import { tryExtractBracketInner, normalizePyBooleansNone, stripHashComments, stripTrailingCommas, splitTopLevelObjects } from "../../../../helpers/parsingHelper";
import { checkEtageRange, ensureDirectionConsistent, ensureTargetNotEqualCurrent } from "../../../../helpers/validationHelper";

export function parseDeklarativKabinenCode(code: string): Kabine[] {
    const base = stripTrailingCommas(normalizePyBooleansNone(stripHashComments(code)));

    const inner = tryExtractBracketInner(base, /kabinen\s*=\s*\[/s, "[", "]");
    if (inner == null) return [];
    const trimmed = inner.trim();
    if (trimmed === "") return [];

    const objects = splitTopLevelObjects(trimmed);
    if (objects.length === 0) {
        throw new Error(`"kabinen"-Block ist leer oder enthält keine Objekte.`);
    }

    const readStrRequired = (s: string, key: string, label: string, idx: number): string => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (String erwartet).`);
        return m[1];
    };
    const readIntRequired = (s: string, key: string, label: string, idx: number): number => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahl erwartet).`);
        return parseInt(m[1], 10);
    };
    const readNumOrNullRequired = (s: string, key: string, label: string, idx: number): number | null => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahl oder null erwartet).`);
        return m[1] === "null" ? null : parseInt(m[1], 10);
    };
    const readBoolRequired = (s: string, key: string, label: string, idx: number): boolean => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(true|false)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (true|false erwartet).`);
        return m[1] === "true";
    };
    const readEnumUpDownNullRequired = (
        s: string, key: string, label: string, idx: number
    ): "up" | "down" | null => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(?:"(up|down)"|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig ("up"|"down"|null erwartet).`);
        return (m[1] as "up" | "down") ?? null;
    };
    const readNumArrayRequired = (s: string, key: string, label: string, idx: number): number[] => {
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
    const seenSides = new Set<KabineSide>();
    const seenIds = new Set<string>();

    objects.forEach((obj, i) => {
        const idx = i + 1;

        const id = readStrRequired(obj, "id", "id", idx);
        const sideStr = readStrRequired(obj, "side", "side", idx);
        if (sideStr !== "left" && sideStr !== "right") {
            throw new Error(`Kabine #${idx}: Feld "side" muss "left" oder "right" sein.`);
        }
        const side = sideStr as KabineSide;

        if (id !== `kabine-${side}`) {
            throw new Error(
                `Kabine #${idx}: "id" muss "kabine-${side}" sein (gefunden "${id}").`
            );
        }

        if (seenSides.has(side)) {
            throw new Error(`Doppelte Kabine für Seite "${side}".`);
        }
        if (seenIds.has(id)) {
            throw new Error(`Doppelte "id" "${id}".`);
        }
        seenSides.add(side);
        seenIds.add(id);

        const currentEtage = readIntRequired(obj, "current_etage", "current_etage", idx);
        checkEtageRange(currentEtage, "current_etage", idx);

        const targetEtage = readNumOrNullRequired(obj, "target_etage", "target_etage", idx);
        if (targetEtage !== null) checkEtageRange(targetEtage, "target_etage", idx);
        ensureTargetNotEqualCurrent(targetEtage, currentEtage, idx);

        const isMoving = readBoolRequired(obj, "is_moving", "is_moving", idx);
        const doorsOpen = readBoolRequired(obj, "tuer_offen", "tuer_offen", idx);

        const callQueue = readNumArrayRequired(obj, "call_queue", "call_queue", idx);
        callQueue.forEach((n) => checkEtageRange(n, "call_queue", idx));

        const directionMovement = readEnumUpDownNullRequired(
            obj, "direction_movement", "direction_movement", idx
        );
        ensureDirectionConsistent(directionMovement, currentEtage, targetEtage, idx);

        const hasBedienpanel = readBoolRequired(obj, "has_bedienpanel", "has_bedienpanel", idx);

        const aktiveZielEtagen = readNumArrayRequired(
            obj, "aktive_ziel_etagen", "aktive_ziel_etagen", idx
        );
        aktiveZielEtagen.forEach((n) => checkEtageRange(n, "aktive_ziel_etagen", idx));

        kabinen.push({
            id,
            side,
            currentEtage,
            doorsOpen,
            targetEtage,
            isMoving,
            callQueue,
            directionMovement,
            hasBedienpanel,
            aktiveZielEtagen,
            doorsState: doorsOpen ? "open" : "closed",
        });
    });

    if (kabinen.length > 2) {
        throw new Error(`Zu viele Kabinen definiert (${kabinen.length}). Maximal sind 2 erlaubt (left & right).`);
    }

    return kabinen.sort((a, b) => (a.side === b.side ? a.id.localeCompare(b.id) : a.side === "left" ? -1 : 1));
}
import type { Kabine } from "../../../../store/kabineSlice";

/**
 * Парсер императивных присваиваний kabine_<id>_* = ...
 * Принимает etage_<n> и None в полях этажей.
 * Строго проверяет диапазон этажей (1..3) для current/target/массивов,
 * согласованность direction vs target/current,
 * и добавляет в state doorsState из tuer_offen (в код не выводим).
 */
export function parseImperativKabinenCode(code: string): Kabine[] {
    const lines = code.split("\n");

    // собираем присваивания; игнорим пустые и комментарии (# ...)
    type Acc = Record<string, Record<string, string>>;
    const acc: Acc = {};
    const assignRe = /^\s*kabine_(\d+)_([a-z_]+)\s*=\s*(.+?)\s*$/;

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.replace(/#.*$/, "").trim();
        if (!line) continue;
        const m = line.match(assignRe);
        if (!m) continue;
        const [, idStr, key, val] = m;
        (acc[idStr] ||= {})[key] = val.trim();
    }

    const ids = Object.keys(acc).map(Number).sort((a, b) => a - b);
    if (ids.length === 0) return [];

    // utils
    const etageVarRe = /^etage_(\d+)$/i;
    const parseIntStrict = (src: string, label: string, kabIdx: number): number => {
        const m = src.match(/^-?\d+$/);
        if (!m) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss eine ganze Zahl sein.`);
        return parseInt(src, 10);
    };
    const checkRange = (val: number, label: string, kabIdx: number) => {
        if (val < 1 || val > 3) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss zwischen 1 und 3 liegen.`);
    };
    const parseEtageVar = (src: string, label: string, kabIdx: number): number => {
        const m = src.match(etageVarRe);
        if (!m) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss etage_<n> sein.`);
        const n = parseInt(m[1], 10);
        checkRange(n, label, kabIdx);
        return n;
    };
    const parseEtageVarOrNone = (src: string, label: string, kabIdx: number): number | null => {
        if (/^None$/i.test(src)) return null;
        return parseEtageVar(src, label, kabIdx);
    };
    const parseEtageVarArray = (src: string, label: string, kabIdx: number): number[] => {
        const m = src.match(/^\[\s*(.*?)\s*\]$/);
        if (!m) throw new Error(`Kabine #${kabIdx}: Feld "${label}" muss ein Array von etage_<n> sein, z.B. [etage_1, etage_3].`);
        const body = m[1].trim();
        if (!body) return [];
        const parts = body.split(",").map((s) => s.trim()).filter(Boolean);
        const arr: number[] = [];
        for (const p of parts) arr.push(parseEtageVar(p, label, kabIdx));
        return arr;
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

        // обязательные
        if (obj["id"] === undefined) throw new Error(`Kabine #${kabIdx}: Feld "id" fehlt.`);
        const idVal = parseIntStrict(obj["id"], "id", kabIdx);
        if (idVal !== idNum) throw new Error(`Kabine #${kabIdx}: "id" muss ${idNum} sein (gemäß Präfix).`);

        if (obj["current_etage"] === undefined) throw new Error(`Kabine #${kabIdx}: Feld "current_etage" fehlt.`);
        const currentEtage = parseEtageVar(obj["current_etage"], "current_etage", kabIdx);

        // опциональные
        let targetEtage: number | null = null;
        if (obj["target_etage"] !== undefined) {
            targetEtage = parseEtageVarOrNone(obj["target_etage"], "target_etage", kabIdx);
            if (targetEtage !== null && targetEtage === currentEtage) {
                throw new Error(`Kabine #${kabIdx}: "target_etage" darf nicht der aktuellen Etage entsprechen.`);
            }
        }

        const isMoving = obj["is_moving"] !== undefined
            ? parseBoolPy(obj["is_moving"], "is_moving", kabIdx)
            : false;

        const tuerOffen = obj["tuer_offen"] !== undefined
            ? parseBoolPy(obj["tuer_offen"], "tuer_offen", kabIdx)
            : false;

        const hasBedienpanel = obj["has_bedienpanel"] !== undefined
            ? parseBoolPy(obj["has_bedienpanel"], "has_bedienpanel", kabIdx)
            : false;

        const directionMovement = obj["direction_movement"] !== undefined
            ? parseDir(obj["direction_movement"], "direction_movement", kabIdx)
            : null;

        let callQueue: number[] = [];
        if (obj["call_queue"] !== undefined) {
            callQueue = parseEtageVarArray(obj["call_queue"], "call_queue", kabIdx);
        }

        let aktiveZielEtagen: number[] = [];
        if (obj["aktive_ziel_etagen"] !== undefined) {
            aktiveZielEtagen = parseEtageVarArray(obj["aktive_ziel_etagen"], "aktive_ziel_etagen", kabIdx);
        }

        // согласование направления и цели (если оба заданы)
        if (directionMovement && targetEtage !== null) {
            if (directionMovement === "up" && targetEtage < currentEtage) {
                throw new Error(`Kabine #${kabIdx}: "direction_movement" widerspricht target/current.`);
            }
            if (directionMovement === "down" && targetEtage > currentEtage) {
                throw new Error(`Kabine #${kabIdx}: "direction_movement" widerspricht target/current.`);
            }
        }

        const doorsState: "open" | "closed" = tuerOffen ? "open" : "closed";

        out.push({
            id: `kabine-${idNum}`,
            currentEtage,
            targetEtage,
            isMoving,
            doorsOpen: tuerOffen,
            callQueue,
            directionMovement,
            hasBedienpanel,
            aktiveZielEtagen,
            doorsState, // в state (в код не выводим)
        });
    });

    return out;
}


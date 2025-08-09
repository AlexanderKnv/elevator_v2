import type { Kabine } from "../../../../store/kabineSlice";

// --- извлечение блока kabinen = [ ... ] с учётом вложенных скобок
function extractKabinenInner(code: string): string {
    const m = code.match(/kabinen\s*=\s*\[/s);
    if (!m) throw new Error(`Kein "kabinen"-Block gefunden.`);
    let i = (m.index ?? 0) + m[0].length, depth = 1;
    while (i < code.length && depth > 0) {
        const ch = code[i];
        if (ch === "[") depth++;
        else if (ch === "]") depth--;
        i++;
    }
    if (depth !== 0) throw new Error(`"kabinen"-Block hat eine unausgeglichene Klammerung.`);
    const start = (m.index ?? 0) + m[0].length;
    const end = i - 1;
    return code.slice(start, end);
}

export function parseDeklarativKabinenCode(code: string): Kabine[] {
    let inner = extractKabinenInner(code)
        .replace(/^\s*#.*$/gm, "")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bNone\b/g, "null")
        .replace(/,\s*([}\]])/g, "$1")
        .trim();

    if (inner === "") return [];

    // --- делим на объекты по {}
    const objects: string[] = [];
    {
        let depth = 0, start = -1;
        for (let i = 0; i < inner.length; i++) {
            const ch = inner[i];
            if (ch === "{") { if (depth === 0) start = i; depth++; }
            else if (ch === "}") { depth--; if (depth === 0 && start !== -1) { objects.push(inner.slice(start, i + 1)); start = -1; } }
        }
    }
    if (objects.length === 0) throw new Error(`"kabinen"-Block ist leer oder enthält keine Objekte.`);

    // --- утилиты
    const hasKey = (s: string, key: string) => new RegExp(`"${key}"\\s*:`).test(s);

    const checkEtageRange = (val: number, label: string, idx: number) => {
        if (val < 1 || val > 3) {
            throw new Error(`Kabine #${idx}: Feld "${label}" muss zwischen 1 und 3 liegen.`);
        }
    };

    const reqInt = (s: string, key: string, label: string, idx: number): number => {
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" fehlt oder ist ungültig (Zahl erwartet).`);
        const val = parseInt(m[1], 10);
        checkEtageRange(val, label, idx);
        return val;
    };

    const optNumOrNullEtage = (s: string, key: string, label: string, idx: number): number | null => {
        if (!hasKey(s, key)) return null;
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss Zahl oder null sein.`);
        if (m[1] === "null") return null;
        const val = parseInt(m[1], 10);
        checkEtageRange(val, label, idx);
        return val;
    };

    const optBool = (s: string, key: string, label: string, idx: number): boolean | null => {
        if (!hasKey(s, key)) return null;
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(true|false)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss true|false sein.`);
        return m[1] === "true";
    };

    const optEnumUpDownNull = (s: string, key: string, label: string, idx: number): "up" | "down" | null => {
        if (!hasKey(s, key)) return null;
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*(?:"(up|down)"|null)`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss "up"|"down"|null sein.`);
        return m[1] ? (m[1] as "up" | "down") : null;
    };

    const optNumArrayEtagen = (s: string, key: string, label: string, idx: number): number[] => {
        if (!hasKey(s, key)) return [];
        const m = s.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`));
        if (!m) throw new Error(`Kabine #${idx}: Feld "${label}" muss ein Zahlen-Array sein, z.B. [1, 2].`);
        const body = m[1].trim();
        if (!body) return [];
        const vals = body.split(",").map((x) => x.trim()).filter(Boolean);
        const arr: number[] = [];
        for (const v of vals) {
            const n = parseInt(v, 10);
            if (!Number.isInteger(n)) throw new Error(`Kabine #${idx}: "${label}" enthält ungültigen Wert "${v}" (Zahl erwartet).`);
            checkEtageRange(n, label, idx);
            arr.push(n);
        }
        return arr;
    };

    // --- разбор
    const kabinen: Kabine[] = [];
    const seenIds = new Set<number>();

    objects.forEach((obj, i) => {
        const idx = i + 1;

        const idNum = reqInt(obj, "id", "id", idx);
        if (idNum <= 0) throw new Error(`Kabine #${idx}: "id" muss > 0 sein.`);
        if (seenIds.has(idNum)) throw new Error(`Kabine #${idx}: doppelte "id" (${idNum}).`);
        seenIds.add(idNum);

        const currentEtage = reqInt(obj, "current_etage", "current_etage", idx);
        const targetEtage = optNumOrNullEtage(obj, "target_etage", "target_etage", idx);

        if (targetEtage !== null && targetEtage === currentEtage) {
            throw new Error(`Kabine #${idx}: "target_etage" darf nicht der aktuellen Etage entsprechen.`);
        }

        const isMoving = optBool(obj, "is_moving", "is_moving", idx) ?? false;
        const tuerOffen = optBool(obj, "tuer_offen", "tuer_offen", idx) ?? false;

        const callQueue = optNumArrayEtagen(obj, "call_queue", "call_queue", idx);
        const directionMovement = optEnumUpDownNull(obj, "direction_movement", "direction_movement", idx);
        const hasBedienpanel = optBool(obj, "has_bedienpanel", "has_bedienpanel", idx) ?? false;
        const aktiveZielEtagen = optNumArrayEtagen(obj, "aktive_ziel_etagen", "aktive_ziel_etagen", idx);

        if (directionMovement && targetEtage !== null) {
            if (directionMovement === "up" && targetEtage < currentEtage) {
                throw new Error(`Kabine #${idx}: "direction_movement" widerspricht target/current.`);
            }
            if (directionMovement === "down" && targetEtage > currentEtage) {
                throw new Error(`Kabine #${idx}: "direction_movement" widerspricht target/current.`);
            }
        }

        // вычисляем doorsState на основе tuer_offen
        const doorsState: 'open' | 'closed' = tuerOffen ? 'open' : 'closed';

        kabinen.push({
            id: `kabine-${idNum}`,
            currentEtage,
            targetEtage,
            isMoving,
            doorsOpen: tuerOffen,
            callQueue,
            directionMovement: directionMovement ?? null,
            hasBedienpanel,
            aktiveZielEtagen,
            doorsState, // в стейте, но не выводим в код
        });
    });

    return kabinen;
}






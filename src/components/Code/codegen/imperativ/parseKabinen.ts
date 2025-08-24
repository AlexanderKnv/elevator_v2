import type { Kabine, KabineSide } from "../../../../store/kabineSlice";
import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseImperativKabinenCode(code: string): Kabine[] {
    const base = stripHashComments(code);

    const readStr = (src: string, idx: number, key: string, label: string): string => {
        const re = new RegExp(`\\bkabine_${idx}_${key}\\s*=\\s*"([^"]+)"`);
        const m = src.match(re);
        if (!m) throw new Error(`Kabine ${idx}: Feld "${label}" fehlt oder ist ungültig (String erwartet).`);
        return m[1];
    };

    const readBoolTF = (src: string, idx: number, key: string, label: string): boolean => {
        const re = new RegExp(`\\bkabine_${idx}_${key}\\s*=\\s*(True|False|true|false)`);
        const m = src.match(re);
        if (!m) throw new Error(`Kabine ${idx}: Feld "${label}" fehlt oder ist ungültig (True|False erwartet).`);
        return m[1].toLowerCase() === "true";
    };

    const readEtageVar = (src: string, idx: number, key: string, label: string): number => {
        const re = new RegExp(`\\bkabine_${idx}_${key}\\s*=\\s*(etage_(\\d+))`);
        const m = src.match(re);
        if (!m) throw new Error(`Kabine ${idx}: Feld "${label}" muss etage_<n> sein.`);
        const n = parseInt(m[2], 10);
        checkEtageRange(n, label, idx);
        return n;
    };

    const readEtageVarOrNone = (src: string, idx: number, key: string, label: string): number | null => {
        const re = new RegExp(`\\bkabine_${idx}_${key}\\s*=\\s*(None|null|etage_(\\d+))`);
        const m = src.match(re);
        if (!m) throw new Error(`Kabine ${idx}: Feld "${label}" muss None/null oder etage_<n> sein.`);
        if (m[1].toLowerCase() === "none" || m[1].toLowerCase() === "null") return null;
        const n = parseInt(m[2], 10);
        checkEtageRange(n, label, idx);
        return n;
    };

    const readEtageVarArray = (src: string, idx: number, key: string, label: string): number[] => {
        const re = new RegExp(`\\bkabine_${idx}_${key}\\s*=\\s*\\[([^\\]]*)\\]`);
        const m = src.match(re);
        if (!m) throw new Error(`Kabine ${idx}: Feld "${label}" fehlt oder ist ungültig (Liste erwartet).`);
        const body = m[1].trim();
        if (!body) return [];
        const parts = body.split(",").map((p) => p.trim()).filter(Boolean);
        const out: number[] = [];
        const seen = new Set<number>();
        for (const p of parts) {
            const mm = p.match(/^etage_(\d+)$/i);
            if (!mm) throw new Error(`Kabine ${idx}: "${label}" enthält ungültigen Eintrag "${p}" (erwartet etage_<n>).`);
            const n = parseInt(mm[1], 10);
            checkEtageRange(n, label, idx);
            if (seen.has(n)) throw new Error(`Kabine ${idx}: "${label}" enthält Duplikat Etage ${n}.`);
            seen.add(n);
            out.push(n);
        }
        return out;
    };

    const readDirNone = (src: string, idx: number, key: string, label: string): "up" | "down" | null => {
        const re = new RegExp(`\\bkabine_${idx}_${key}\\s*=\\s*(None|null|"up"|"down")`);
        const m = src.match(re);
        if (!m) throw new Error(`Kabine ${idx}: Feld "${label}" muss None/null oder "up"/"down" sein.`);
        const v = m[1];
        if (v.toLowerCase() === "none" || v.toLowerCase() === "null") return null;
        return v.slice(1, -1).toLowerCase() as "up" | "down";
    };

    const hasAnyFor = (idx: number) =>
        new RegExp(
            `\\bkabine_${idx}_(id|side|current_etage|target_etage|is_moving|tuer_offen|call_queue|direction_movement|has_bedienpanel|aktive_ziel_etagen)\\b`
        ).test(base);

    const result: Kabine[] = [];
    const usedSides = new Set<KabineSide>();

    for (let idx = 1; idx <= 2; idx++) {
        if (!hasAnyFor(idx)) continue;

        const id = readStr(base, idx, "id", "id");
        const sideStr = readStr(base, idx, "side", "side");
        if (sideStr !== "left" && sideStr !== "right") {
            throw new Error(`Kabine ${idx}: Feld "side" muss "left" oder "right" sein.`);
        }
        const side = sideStr as KabineSide;
        if (id !== `kabine-${side}`) {
            throw new Error(`Kabine ${idx}: "id" muss "kabine-${side}" sein (gefunden "${id}").`);
        }
        if (usedSides.has(side)) {
            throw new Error(`Doppelte Kabine für Seite "${side}".`);
        }
        usedSides.add(side);

        const currentEtage = readEtageVar(base, idx, "current_etage", "current_etage");
        const targetEtage = readEtageVarOrNone(base, idx, "target_etage", "target_etage");
        const isMoving = readBoolTF(base, idx, "is_moving", "is_moving");
        const doorsOpen = readBoolTF(base, idx, "tuer_offen", "tuer_offen");
        const callQueue = readEtageVarArray(base, idx, "call_queue", "call_queue");
        const directionMovement = readDirNone(base, idx, "direction_movement", "direction_movement");
        const hasBedienpanel = readBoolTF(base, idx, "has_bedienpanel", "has_bedienpanel");
        const aktiveZielEtagen = readEtageVarArray(base, idx, "aktive_ziel_etagen", "aktive_ziel_etagen");

        result.push({
            id,
            side,
            currentEtage,
            targetEtage,
            isMoving,
            doorsOpen,
            callQueue,
            directionMovement,
            hasBedienpanel,
            aktiveZielEtagen,
            doorsState: doorsOpen ? "open" : "closed",
        });
    }

    if (result.length === 0) return [];

    return result.sort((a, b) => (a.side === b.side ? a.id.localeCompare(b.id) : a.side === "left" ? -1 : 1));
}
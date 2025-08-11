import type { Kabine } from "../../../../store/kabineSlice";
import { stripHashComments, splitArgs } from "../../../../helpers/parsingHelper";
import { checkEtageRange, ensureTargetNotEqualCurrent, ensureDirectionConsistent } from "../../../../helpers/validationHelper";
import { toKabineState } from "../../../../helpers/kabineHelper";

export function parseOopKabinenCode(code: string): Kabine[] {
    const text = stripHashComments(code);

    const instanceRe = /kabine_(\d+)\s*=\s*Kabine\s*\(([\s\S]*?)\)/g;
    const kabinen: Kabine[] = [];
    const seen = new Set<number>();

    let match: RegExpExecArray | null;
    while ((match = instanceRe.exec(text)) !== null) {
        const idFromName = parseInt(match[1], 10);
        if (seen.has(idFromName)) {
            throw new Error(`Doppelte Kabinen-Definition für kabine_${idFromName}.`);
        }
        seen.add(idFromName);

        const argsBody = match[2].trim();
        const args = splitArgs(argsBody);
        if (args.length !== 9) {
            throw new Error(
                `Kabine #${idFromName}: Erwartet 9 Argumente (id, current_etage, target_etage, is_moving, tuer_offen, call_queue, direction_movement, has_bedienpanel, aktive_ziel_etagen).`
            );
        }

        // локальные парсеры значений
        const etageVarRe = /^etage_(\d+)$/i;

        const parseIntStrict = (src: string, label: string): number => {
            const t = src.trim();
            const m = t.match(/^-?\d+$/);
            if (!m) throw new Error(`Kabine #${idFromName}: Feld "${label}" muss eine ganze Zahl sein.`);
            return parseInt(t, 10);
        };

        const parseBoolPy = (src: string, label: string): boolean => {
            const t = src.trim();
            if (/^True$/i.test(t)) return true;
            if (/^False$/i.test(t)) return false;
            throw new Error(`Kabine #${idFromName}: Feld "${label}" muss True|False sein.`);
        };

        const parseDir = (src: string, label: string): "up" | "down" | null => {
            const t = src.trim();
            if (/^None$/i.test(t)) return null;
            const m = t.match(/^"(up|down)"$/);
            if (!m) throw new Error(`Kabine #${idFromName}: Feld "${label}" muss "up"|"down"|None sein.`);
            return m[1] as "up" | "down";
        };

        const parseEtageVar = (src: string, label: string): number => {
            const t = src.trim();
            const m = t.match(etageVarRe);
            if (!m) throw new Error(`Kabine #${idFromName}: Feld "${label}" muss etage_<n> sein.`);
            const num = parseInt(m[1], 10);
            checkEtageRange(num, label, idFromName);
            return num;
        };

        const parseEtageVarOrNone = (src: string, label: string): number | null => {
            const t = src.trim();
            if (/^None$/i.test(t)) return null;
            return parseEtageVar(t, label);
        };

        const parseEtageVarArray = (src: string, label: string): number[] => {
            const t = src.trim();
            const m = t.match(/^\[\s*(.*?)\s*\]$/);
            if (!m) {
                throw new Error(
                    `Kabine #${idFromName}: Feld "${label}" muss eine Liste von etage_<n> sein, z.B. [etage_1, etage_3].`
                );
            }
            const body = m[1].trim();
            if (!body) return [];
            return body.split(",").map((s) => parseEtageVar(s.trim(), label));
        };

        // позиционные аргументы
        const idArg = parseIntStrict(args[0], "id");
        if (idArg !== idFromName) {
            throw new Error(`Kabine #${idFromName}: "id" muss ${idFromName} sein (gemäß Variablennamen).`);
        }

        const currentEtage = parseEtageVar(args[1], "current_etage");
        const targetEtage = parseEtageVarOrNone(args[2], "target_etage");
        ensureTargetNotEqualCurrent(targetEtage, currentEtage, idFromName);

        const isMoving = parseBoolPy(args[3], "is_moving");
        const tuerOffen = parseBoolPy(args[4], "tuer_offen");
        const callQueue = parseEtageVarArray(args[5], "call_queue");
        const directionMovement = parseDir(args[6], "direction_movement");
        const hasBedienpanel = parseBoolPy(args[7], "has_bedienpanel");
        const aktiveZielEtagen = parseEtageVarArray(args[8], "aktive_ziel_etagen");

        ensureDirectionConsistent(directionMovement, currentEtage, targetEtage, idFromName);

        kabinen.push(
            toKabineState({
                idNum: idFromName,
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
    }

    return kabinen;
}

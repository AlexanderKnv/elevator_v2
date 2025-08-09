import type { Kabine } from "../../../../store/kabineSlice";

/**
 * Парсит OOP-инстансы вида:
 *
 * kabine_1 = Kabine(1, etage_2, None, False, False, [etage_1, etage_3], "up", False, [])
 *
 * Допуски:
 * - пробелы/переносы строк внутри скобок
 * - булевы True/False, None
 * - direction_movement: "up"|"down"|None
 * - поля с этажами — переменные etage_<n>, где n в диапазоне 1..3
 *
 * Строго проверяем диапазон этажей 1..3 для current/target/массивов.
 * doorsState добавляем в state из tuer_offen (в код не выводим).
 */
export function parseOopKabinenCode(code: string): Kabine[] {
    // Разбиваем на блоки по присваиванию экземпляра
    const instanceRe = /kabine_(\d+)\s*=\s*Kabine\s*\(([\s\S]*?)\)/g;
    const kabinen: Kabine[] = [];
    const seen = new Set<number>();

    let match: RegExpExecArray | null;
    while ((match = instanceRe.exec(code)) !== null) {
        const idFromName = parseInt(match[1], 10);
        if (seen.has(idFromName)) {
            throw new Error(`Doppelte Kabinen-Definition für kabine_${idFromName}.`);
        }
        seen.add(idFromName);

        const argsBody = match[2].replace(/#.*$/gm, "").trim();
        const args = splitArgs(argsBody);
        if (args.length !== 9) {
            throw new Error(
                `Kabine #${idFromName}: Erwartet 9 Argumente (id, current_etage, target_etage, is_moving, tuer_offen, call_queue, direction_movement, has_bedienpanel, aktive_ziel_etagen).`
            );
        }

        // helpers
        const etageVarRe = /^etage_(\d+)$/i;
        const checkRange = (val: number, label: string) => {
            if (val < 1 || val > 3) {
                throw new Error(`Kabine #${idFromName}: Feld "${label}" muss zwischen 1 und 3 liegen.`);
            }
        };
        const parseEtageVar = (src: string, label: string): number => {
            const m = src.trim().match(etageVarRe);
            if (!m) throw new Error(`Kabine #${idFromName}: Feld "${label}" muss etage_<n> sein.`);
            const num = parseInt(m[1], 10);
            checkRange(num, label);
            return num;
        };
        const parseEtageVarOrNone = (src: string, label: string): number | null => {
            const t = src.trim();
            if (/^None$/i.test(t)) return null;
            return parseEtageVar(t, label);
        };
        const parseEtageVarArray = (src: string, label: string): number[] => {
            const m = src.trim().match(/^\[\s*(.*?)\s*\]$/);
            if (!m) throw new Error(`Kabine #${idFromName}: Feld "${label}" muss eine Liste von etage_<n> sein, z.B. [etage_1, etage_3].`);
            const body = m[1].trim();
            if (!body) return [];
            return body.split(",").map((s) => {
                const mm = s.trim().match(etageVarRe);
                if (!mm) throw new Error(`Kabine #${idFromName}: "${label}" enthält ungültigen Wert "${s.trim()}" (erwartet etage_<n>).`);
                const num = parseInt(mm[1], 10);
                checkRange(num, label);
                return num;
            });
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
        const parseIntStrict = (src: string, label: string): number => {
            const t = src.trim();
            const m = t.match(/^-?\d+$/);
            if (!m) throw new Error(`Kabine #${idFromName}: Feld "${label}" muss eine ganze Zahl sein.`);
            return parseInt(t, 10);
        };

        // позиционные аргументы по порядку
        const idArg = parseIntStrict(args[0], "id");
        if (idArg !== idFromName) {
            throw new Error(`Kabine #${idFromName}: "id" muss ${idFromName} sein (gemäß Variablennamen).`);
        }

        const currentEtage = parseEtageVar(args[1], "current_etage");
        const targetEtage = parseEtageVarOrNone(args[2], "target_etage");
        const isMoving = parseBoolPy(args[3], "is_moving");
        const tuerOffen = parseBoolPy(args[4], "tuer_offen");
        const callQueue = parseEtageVarArray(args[5], "call_queue");
        const directionMovement = parseDir(args[6], "direction_movement");
        const hasBedienpanel = parseBoolPy(args[7], "has_bedienpanel");
        const aktiveZielEtagen = parseEtageVarArray(args[8], "aktive_ziel_etagen");

        // согласование направления/цели (если есть)
        if (directionMovement && targetEtage !== null) {
            if (directionMovement === "up" && targetEtage < currentEtage) {
                throw new Error(`Kabine #${idFromName}: "direction_movement" widerspricht target/current.`);
            }
            if (directionMovement === "down" && targetEtage > currentEtage) {
                throw new Error(`Kabine #${idFromName}: "direction_movement" widerspricht target/current.`);
            }
        }

        // производное состояние дверей в стейте
        const doorsState: "open" | "closed" = tuerOffen ? "open" : "closed";

        kabinen.push({
            id: `kabine-${idFromName}`,
            currentEtage,
            targetEtage,
            isMoving,
            doorsOpen: tuerOffen,
            callQueue,
            directionMovement,
            hasBedienpanel,
            aktiveZielEtagen,
            doorsState,
        });
    }

    return kabinen;
}

/** Разделяет строку аргументов Kabine(...) на 9 элементов, учитывая скобки/массивы/переносы. */
function splitArgs(argsBody: string): string[] {
    const out: string[] = [];
    let buf = "";
    let depthParen = 0;
    let depthBracket = 0;

    for (let i = 0; i < argsBody.length; i++) {
        const ch = argsBody[i];
        if (ch === "(") depthParen++;
        else if (ch === ")") depthParen--;
        else if (ch === "[") depthBracket++;
        else if (ch === "]") depthBracket--;

        if (ch === "," && depthParen === 0 && depthBracket === 0) {
            out.push(buf.trim());
            buf = "";
        } else {
            buf += ch;
        }
    }
    if (buf.trim()) out.push(buf.trim());
    return out;
}

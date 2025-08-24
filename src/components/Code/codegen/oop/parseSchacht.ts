import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";
import type { SchachtState, SchachtSide } from "../../../../store/schachtSlice";

export function parseOopSchachtCode(code: string): SchachtState {
    const text = stripHashComments(code);

    const re = /schacht_panel_(\d+)_(left|right)\s*=\s*SchachtPanel\(\s*etage_(\d+)\s*,\s*"(left|right)"\s*\)/g;

    const byEtage = new Map<number, Set<SchachtSide>>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const etageVarNum = parseInt(m[1], 10);
        const sideFromName = m[2] as SchachtSide;
        const etageArgNum = parseInt(m[3], 10);
        const sideFromArg = m[4] as SchachtSide;

        if (etageVarNum !== etageArgNum) {
            throw new Error(
                `SchachtPanel für Etage ${etageVarNum}: Variablenname und Argument etage_<n> widersprechen sich.`
            );
        }
        if (sideFromName !== sideFromArg) {
            throw new Error(
                `SchachtPanel für Etage ${etageVarNum}: Variablenname-Seite (${sideFromName}) und Argument-Seite (${sideFromArg}) widersprechen sich.`
            );
        }

        checkEtageRange(etageVarNum, "schacht", etageVarNum);

        if (!byEtage.has(etageVarNum)) byEtage.set(etageVarNum, new Set());
        const set = byEtage.get(etageVarNum)!;
        if (set.has(sideFromName)) {
            throw new Error(
                `SchachtPanel Etage ${etageVarNum}: doppelte Seite "${sideFromName}".`
            );
        }
        set.add(sideFromName);
    }

    const etagenMitSchacht = Array.from(byEtage.entries())
        .map(([etage, sides]) => ({
            etage,
            sides: Array.from(sides).sort((a, b) =>
                a === b ? 0 : a === "left" ? -1 : 1
            ),
        }))
        .sort((a, b) => a.etage - b.etage);

    return { etagenMitSchacht };
}

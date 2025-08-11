import type { Kabine } from "../../../../store/kabineSlice";
import { sortKabinenById, getKabineIdNumber } from "../../../../helpers/kabineHelper";
import { pyBoolTF, etageVar, etageVarOrNone, etageVarArray, pyNoneOrQuoted } from "../../../../helpers/renderHelper";

export function generateImperativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

    return sortKabinenById(kabinen).map((k) => {
        const idNum = getKabineIdNumber(k.id);
        return [
            `# Kabine ${idNum}`,
            `kabine_${idNum}_id = ${idNum}`,
            `kabine_${idNum}_current_etage = ${etageVar(k.currentEtage)}`,
            `kabine_${idNum}_target_etage = ${etageVarOrNone(k.targetEtage)}`,
            `kabine_${idNum}_is_moving = ${pyBoolTF(!!k.isMoving)}`,
            `kabine_${idNum}_tuer_offen = ${pyBoolTF(!!k.doorsOpen)}`,
            `kabine_${idNum}_call_queue = ${etageVarArray(k.callQueue ?? [])}`,
            `kabine_${idNum}_direction_movement = ${pyNoneOrQuoted(k.directionMovement ?? null)}`,
            `kabine_${idNum}_has_bedienpanel = ${pyBoolTF(!!k.hasBedienpanel)}`,
            `kabine_${idNum}_aktive_ziel_etagen = ${etageVarArray(k.aktiveZielEtagen ?? [])}`,
            ``,
        ].join("\n");
    }).join("\n");
}
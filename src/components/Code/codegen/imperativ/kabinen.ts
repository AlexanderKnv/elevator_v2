import type { Kabine } from "../../../../store/kabineSlice";
import { sortKabinenById } from "../../../../helpers/kabineHelper";
import { pyBoolTF, etageVar, etageVarOrNone, etageVarArray, pyNoneOrQuoted } from "../../../../helpers/renderHelper";

export function generateImperativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

    const sorted = sortKabinenById(kabinen);

    const blocks = sorted.map((k, idx) => {
        const num = idx + 1;
        return [
            `# Kabine ${num}`,
            `kabine_${num}_id = "${k.id}"`,
            `kabine_${num}_side = "${k.side}"`,
            `kabine_${num}_current_etage = ${etageVar(k.currentEtage)}`,
            `kabine_${num}_target_etage = ${etageVarOrNone(k.targetEtage)}`,
            `kabine_${num}_is_moving = ${pyBoolTF(k.isMoving)}`,
            `kabine_${num}_tuer_offen = ${pyBoolTF(k.doorsOpen)}`,
            `kabine_${num}_call_queue = ${etageVarArray(k.callQueue)}`,
            `kabine_${num}_direction_movement = ${pyNoneOrQuoted(k.directionMovement)}`,
            `kabine_${num}_has_bedienpanel = ${pyBoolTF(k.hasBedienpanel)}`,
            `kabine_${num}_aktive_ziel_etagen = ${etageVarArray(k.aktiveZielEtagen)}`,
        ].join("\n");
    });

    return blocks.join("\n\n");
}
import type { Kabine } from "../../../../store/kabineSlice";
import { sortKabinenById, getKabineIdNumber } from "../../../../helpers/kabineHelper";
import { pyBool, pyNullNum, pyNullStr, pyNumArray } from "../../../../helpers/renderHelper";

export function generateDeklarativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

    const items = sortKabinenById(kabinen).map((k) => {
        const idNum = getKabineIdNumber(k.id);

        return [
            `    {`,
            `        "id": ${idNum},`,
            `        "current_etage": ${k.currentEtage},`,
            `        "target_etage": ${pyNullNum(k.targetEtage)},`,
            `        "is_moving": ${pyBool(!!k.isMoving)},`,
            `        "tuer_offen": ${pyBool(!!k.doorsOpen)},`,
            `        "call_queue": ${pyNumArray(k.callQueue ?? [])},`,
            `        "direction_movement": ${pyNullStr(k.directionMovement ?? null)},`,
            `        "has_bedienpanel": ${pyBool(!!k.hasBedienpanel)},`,
            `        "aktive_ziel_etagen": ${pyNumArray(k.aktiveZielEtagen ?? [])}`,
            `    }`,
        ].join("\n");
    });

    return `kabinen = [\n${items.join(",\n")}\n]`;
}
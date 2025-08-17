import type { Kabine } from "../../../../store/kabineSlice";
import { sortKabinenById, getKabineIdNumber } from "../../../../helpers/kabineHelper";
import { pyBoolTF, etageVar, etageVarOrNone, etageVarArray, pyNoneOrQuoted } from "../../../../helpers/renderHelper";

export function generateOopKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) {
        return "";
    }

    const instances = sortKabinenById(kabinen).map((k) => {
        const idNum = getKabineIdNumber(k.id);
        const args = [
            `${idNum}`,
            `${etageVar(k.currentEtage)}`,
            `${etageVarOrNone(k.targetEtage)}`,
            `${pyBoolTF(!!k.isMoving)}`,
            `${pyBoolTF(!!k.doorsOpen)}`,
            `${etageVarArray(k.callQueue ?? [])}`,
            `${pyNoneOrQuoted(k.directionMovement ?? null)}`,
            `${pyBoolTF(!!k.hasBedienpanel)}`,
            `${etageVarArray(k.aktiveZielEtagen ?? [])}`,
        ].join(", ");

        return `# Kabine ${idNum}\nkabine_${idNum} = Kabine(${args})\n`;
    });

    return [oopClassDef(), "", ...instances].join("\n");
}

function oopClassDef(): string {
    return [
        `class Kabine:`,
        `    def __init__(self, id, current_etage, target_etage, is_moving, tuer_offen,`,
        `                 call_queue, direction_movement, has_bedienpanel, aktive_ziel_etagen):`,
        `        self.id = id`,
        `        self.current_etage = current_etage`,
        `        self.target_etage = target_etage`,
        `        self.is_moving = is_moving`,
        `        self.tuer_offen = tuer_offen`,
        `        self.call_queue = call_queue`,
        `        self.direction_movement = direction_movement`,
        `        self.has_bedienpanel = has_bedienpanel`,
        `        self.aktive_ziel_etagen = aktive_ziel_etagen`,
    ].join("\n");
}
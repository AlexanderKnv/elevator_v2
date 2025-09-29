/** @packageDocumentation
 * # OOP-Generator: Kabinen (`generateOopKabinenCode`)
 *
 * - Sortiert die Kabinen deterministisch via `sortKabinenById`.
 * - Definiert eine Python-Klasse `Kabine` mit vollständigem `__init__(...)`.
 * - Erzeugt pro Eintrag eine Instanz: `kabine_<side> = Kabine("id", "side", etage_<n>, etage_<n>|None, True/False, True/False, [etage_*], "up"|"down"|None, True/False, [etage_*])`.
 * - Verwendet Formatter: `etageVar`, `etageVarOrNone`, `pyBoolTF`, `etageVarArray`, `pyNoneOrQuoted`.
 * - Gibt Klassendefinition + Instanzzuweisungen als zusammenhängenden String zurück (Blöcke durch Leerzeile getrennt).
 */

import type { Kabine } from "../../../../store/kabineSlice";
import { sortKabinenById } from "../../../../helpers/kabineHelper";
import { pyBoolTF, etageVar, etageVarOrNone, etageVarArray, pyNoneOrQuoted } from "../../../../helpers/renderHelper";

export function generateOopKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

    const sorted = sortKabinenById(kabinen);

    const classDef = [
        `class Kabine:`,
        `    def __init__(self, id, side, current_etage, target_etage, is_moving, tuer_offen, call_queue, direction_movement, has_bedienpanel, aktive_ziel_etagen):`,
        `        self.id = id`,
        `        self.side = side`,
        `        self.current_etage = current_etage`,
        `        self.target_etage = target_etage`,
        `        self.is_moving = is_moving`,
        `        self.tuer_offen = tuer_offen`,
        `        self.call_queue = call_queue`,
        `        self.direction_movement = direction_movement`,
        `        self.has_bedienpanel = has_bedienpanel`,
        `        self.aktive_ziel_etagen = aktive_ziel_etagen`,
        ``,
    ].join("\n");

    const instances = sorted
        .map((k, idx) => {
            const num = idx + 1;
            return [
                `# Kabine ${num}`,
                `kabine_${k.side} = Kabine(` +
                `"${k.id}", ` +
                `"${k.side}", ` +
                `${etageVar(k.currentEtage)}, ` +
                `${etageVarOrNone(k.targetEtage)}, ` +
                `${pyBoolTF(!!k.isMoving)}, ` +
                `${pyBoolTF(!!k.doorsOpen)}, ` +
                `${etageVarArray(k.callQueue)}, ` +
                `${pyNoneOrQuoted(k.directionMovement)}, ` +
                `${pyBoolTF(!!k.hasBedienpanel)}, ` +
                `${etageVarArray(k.aktiveZielEtagen)}` +
                `)`
            ].join("\n");
        })
        .join("\n\n");

    return [classDef, instances].join("\n").trimEnd();
}
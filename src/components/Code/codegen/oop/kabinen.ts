import type { Kabine } from "../../../../store/kabineSlice";

export function generateOopKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) {
        return oopClassDef().trim();
    }

    const toBoolPy = (v: boolean) => (v ? "True" : "False");
    const etageVar = (n: number) => `etage_${n}`;
    const toEtageVarOrNone = (v: number | null | undefined) =>
        v === null || v === undefined || Number.isNaN(v) ? "None" : etageVar(v);
    const toEtageVarArray = (xs: number[] | undefined) =>
        `[${(xs ?? []).map((n) => etageVar(n)).join(", ")}]`;
    const toNoneOrStrPy = (v: string | null | undefined) =>
        v == null ? "None" : `"${v}"`;

    const sorted = [...kabinen].sort((a, b) => {
        const aid = parseInt(a.id.split("-")[1] ?? "0", 10);
        const bid = parseInt(b.id.split("-")[1] ?? "0", 10);
        return aid - bid;
    });

    const instances = sorted.map((k) => {
        const idNum = parseInt(k.id.split("-")[1] ?? "0", 10) || 0;
        const args = [
            `${idNum}`,
            `${etageVar(k.currentEtage)}`,
            `${toEtageVarOrNone(k.targetEtage)}`,
            `${toBoolPy(!!k.isMoving)}`,
            `${toBoolPy(!!k.doorsOpen)}`,
            `${toEtageVarArray(k.callQueue)}`,
            `${toNoneOrStrPy(k.directionMovement)}`,
            `${toBoolPy(!!k.hasBedienpanel)}`,
            `${toEtageVarArray(k.aktiveZielEtagen)}`
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



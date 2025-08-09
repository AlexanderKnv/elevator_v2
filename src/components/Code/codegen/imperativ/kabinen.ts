import type { Kabine } from "../../../../store/kabineSlice";

/**
 * Генерирует императивный код присваиваний вида:
 * kabine_1_current_etage = etage_2
 * kabine_1_target_etage  = None
 * kabine_1_call_queue    = [etage_1, etage_3]
 * Булевы -> True/False, None для отсутствующих.
 * doorsState в код не выводим.
 */
export function generateImperativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

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

    const blocks = sorted.map((k) => {
        const idNum = parseInt(k.id.split("-")[1] ?? "0", 10) || 0;
        const current = k.currentEtage;
        const target = k.targetEtage ?? null;
        const offen = !!k.doorsOpen;
        const queue = k.callQueue ?? [];
        const aktive = k.aktiveZielEtagen ?? [];
        const dir = k.directionMovement ?? null;

        return [
            `# Kabine ${idNum}`,
            `kabine_${idNum}_id = ${idNum}`,
            `kabine_${idNum}_current_etage = ${etageVar(current)}`,
            `kabine_${idNum}_target_etage = ${toEtageVarOrNone(target)}`,
            `kabine_${idNum}_is_moving = ${toBoolPy(!!k.isMoving)}`,
            `kabine_${idNum}_tuer_offen = ${toBoolPy(offen)}`,
            `kabine_${idNum}_call_queue = ${toEtageVarArray(queue)}`,
            `kabine_${idNum}_direction_movement = ${toNoneOrStrPy(dir)}`,
            `kabine_${idNum}_has_bedienpanel = ${toBoolPy(!!k.hasBedienpanel)}`,
            `kabine_${idNum}_aktive_ziel_etagen = ${toEtageVarArray(aktive)}`,
            ``,
        ].join("\n");
    });

    return blocks.join("\n");
}



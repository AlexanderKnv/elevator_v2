import type { Kabine } from "../../../../store/kabineSlice";

/**
 * Генерирует блок `kabinen = [ ... ]` со всеми полями, КРОМЕ doorsState.
 * Порядок ключей фиксирован, булевы -> true/false, null -> null.
 */
export function generateDeklarativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

    const toBool = (v: boolean) => (v ? "true" : "false");
    const toNumOrNull = (v: number | null | undefined) =>
        v === null || v === undefined || Number.isNaN(v) ? "null" : String(v);
    const toStrOrNull = (v: string | null | undefined) =>
        v == null ? "null" : `"${v}"`;
    const toNumArray = (xs: number[] | undefined) =>
        `[${(xs ?? []).map((n) => String(n)).join(", ")}]`;

    const sorted = [...kabinen].sort((a, b) => {
        const aid = parseInt(a.id.split("-")[1] ?? "0", 10);
        const bid = parseInt(b.id.split("-")[1] ?? "0", 10);
        return aid - bid;
    });

    const items = sorted.map((k) => {
        const idNum = parseInt(k.id.split("-")[1] ?? "0", 10) || 0;

        return [
            `    {`,
            `        "id": ${idNum},`,
            `        "current_etage": ${k.currentEtage},`,
            `        "target_etage": ${toNumOrNull(k.targetEtage)},`,
            `        "is_moving": ${toBool(k.isMoving)},`,
            `        "tuer_offen": ${toBool(k.doorsOpen)},`,
            `        "call_queue": ${toNumArray(k.callQueue)},`,
            `        "direction_movement": ${toStrOrNull(k.directionMovement)},`,
            `        "has_bedienpanel": ${toBool(k.hasBedienpanel)},`,
            `        "aktive_ziel_etagen": ${toNumArray(k.aktiveZielEtagen)}`,
            `    }`,
        ].join("\n");
    });

    return `kabinen = [\n${items.join(",\n")}\n]`;
}




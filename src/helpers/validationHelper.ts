export function checkEtageRange(val: number, label: string, kabIdx?: number) {
    if (val < 1 || val > 3) {
        throw new Error(kabIdx ? `Kabine #${kabIdx}: Feld "${label}" muss zwischen 1 und 3 liegen.`
            : `Feld "${label}" muss zwischen 1 und 3 liegen.`);
    }
}

export function ensureTargetNotEqualCurrent(target: number | null, current: number, kabIdx: number) {
    if (target !== null && target === current) {
        throw new Error(`Kabine #${kabIdx}: "target_etage" darf nicht der aktuellen Etage entsprechen.`);
    }
}

export function ensureDirectionConsistent(
    direction: "up" | "down" | null,
    current: number,
    target: number | null,
    kabIdx: number
) {
    if (!direction || target === null) return;
    if ((direction === "up" && target < current) || (direction === "down" && target > current)) {
        throw new Error(`Kabine #${kabIdx}: "direction_movement" widerspricht target/current.`);
    }
}

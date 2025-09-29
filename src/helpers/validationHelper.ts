/** @packageDocumentation
 * # Validierungs-Helper (`validationHelpers.ts`)
 *
 * Sammelstelle für synchrone, ausnahmewurfende (**throw Error**) Prüfungen
 * rund um Etagen, Zielwahl und Bewegungsrichtung der Kabinen.
 * 
 * - `checkEtageRange` — validiert, dass ein Etagenwert im erlaubten Bereich **[1..3]** liegt;
 *   Fehlermeldung enthält optional die Kabinen-Nr. (`kabIdx`) sowie das Feldlabel.
 * - `ensureTargetNotEqualCurrent` — verhindert, dass `target` der `current`-Etage entspricht.
 * - `ensureDirectionConsistent` — prüft Konsistenz zwischen `direction` und der Relation `target` ↔ `current`
 *   (z. B. `direction = 'up'` erfordert `target > current`).
 */

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

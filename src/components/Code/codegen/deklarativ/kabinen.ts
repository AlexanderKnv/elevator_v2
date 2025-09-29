/** @packageDocumentation
 * # Deklarativ-Generator: Kabinen (`generateDeklarativKabinenCode`)
 *
 * - Gibt `""` zurück, wenn keine Kabinen vorhanden sind.
 * - Erzeugt einen JSON-ähnlichen Block: `kabinen = [ { ...kabine... }, ... ]` mit stabiler Feldreihenfolge:
 *   `id`, `side`, `current_etage`, `target_etage`, `is_moving`, `tuer_offen`, `call_queue`,
 *   `direction_movement`, `has_bedienpanel`, `aktive_ziel_etagen`.
 * - Sortiert die Eingabe deterministisch: zuerst `side` (**left** vor **right**), dann `id` (lexikografisch).
 * - Serialisiert Booleans in Kleinbuchstaben (`true/false`) und Zahlenlisten als `[1, 2, 3]` bzw. `[]`.
 * - Setzt `target_etage` auf `null`, wenn kein Ziel vorhanden ist.
 * - Setzt `direction_movement` auf `"up"`/`"down"` oder `null`, wenn unbekannt.
 */

import type { Kabine } from "../../../../store/kabineSlice";

export function generateDeklarativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";

    const bool = (v: boolean) => (v ? "true" : "false");
    const arrNums = (xs?: number[] | null) =>
        Array.isArray(xs) && xs.length > 0 ? `[${xs.join(", ")}]` : "[]";

    const sorted = [...kabinen].sort((a, b) => {
        if (a.side !== b.side) return a.side === "left" ? -1 : 1;
        return a.id.localeCompare(b.id);
    });

    const blocks = sorted.map((k) => {
        const dir = k.directionMovement ? `"${k.directionMovement}"` : "null";
        const target = k.targetEtage == null ? "null" : String(k.targetEtage);

        return [
            `    { "id": "${k.id}",`,
            `      "side": "${k.side}",`,
            `      "current_etage": ${k.currentEtage},`,
            `      "target_etage": ${target},`,
            `      "is_moving": ${bool(!!k.isMoving)},`,
            `      "tuer_offen": ${bool(!!k.doorsOpen)},`,
            `      "call_queue": ${arrNums(k.callQueue)},`,
            `      "direction_movement": ${dir},`,
            `      "has_bedienpanel": ${bool(!!k.hasBedienpanel)},`,
            `      "aktive_ziel_etagen": ${arrNums(k.aktiveZielEtagen)} }`
        ].join("\n");
    });

    return `kabinen = [\n${blocks.join(",\n\n")}\n]`;
}
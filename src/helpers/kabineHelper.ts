/** @packageDocumentation
 * # Kabinen-Utilities (`kabineUtils.ts`)
 *
 * Kleine Hilfsfunktionen für IDs, Sortierung, Türzustand und Richtungsableitung
 * von Aufzugskabinen.
 * 
 * - `getKabineIdNumber(id)` — extrahiert die numerische Suffix-Zahl aus IDs im Format
 *   `"kabine-<n>"`; bei ungültigem Format → **0**.
 * - `sortKabinenById(kabinen)` — liefert eine **neue** Liste, numerisch aufsteigend nach
 *   der extrahierten ID-Nummer sortiert.
 * - `doorsStateFromOpen(open)` — mappt ein Boolean auf den Türzustand (`'open' | 'closed'`).
 * - `deriveDirection(current, target)` — leitet die Fahrtrichtung ab:
 *   `target > current` → `'up'`, `target < current` → `'down'`, sonst `null`.
 */

import type { Kabine } from "../store/kabineSlice";

export const getKabineIdNumber = (id: string) => parseInt(id.split("-")[1] ?? "0", 10) || 0;

export function sortKabinenById(kabinen: Kabine[]) {
    return [...kabinen].sort((a, b) => getKabineIdNumber(a.id) - getKabineIdNumber(b.id));
}

export const doorsStateFromOpen = (open: boolean): "open" | "closed" => (open ? "open" : "closed");

export const deriveDirection = (current: number, target: number | null): "up" | "down" | null => {
    if (target == null) return null;
    if (target > current) return "up";
    if (target < current) return "down";
    return null;
};

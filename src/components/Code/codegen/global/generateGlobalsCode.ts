/** @packageDocumentation
 * # Globals-Generator (`generateGlobalsCode`)
 *
 *  Export der globalen Timing-Parameter.
 *
 * - Gibt `""` zurück, wenn keine Kabinen vorhanden sind (kein Export nötig).
 * - Erzeugt sonst einen zweizeiligen Parameter-Block via `renderGlobals(speedMs, doorTimeMs)`.
 * - Verwendet `globals.speedMs` (Fahrtdauer) und `globals.doorTimeMs` (Türzeit) als Millisekundenwerte.
 */

import { renderGlobals } from "../../../../helpers/renderHelper";
import type { GlobalsState } from "../../../../store/globalsSlice";
import type { Kabine } from "../../../../store/kabineSlice";

export function generateGlobalsCode(globals: GlobalsState, kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";
    return renderGlobals(globals.speedMs, globals.doorTimeMs);
}

import { renderGlobals } from "../../../../helpers/renderHelper";
import type { GlobalsState } from "../../../../store/globalsSlice";
import type { Kabine } from "../../../../store/kabineSlice";

export function generateGlobalsCode(globals: GlobalsState, kabinen: Kabine[]): string {
    if (!kabinen || kabinen.length === 0) return "";
    return renderGlobals(globals.speedMs, globals.doorTimeMs);
}

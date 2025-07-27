import type { Kabine } from "../../../../store/kabineSlice";

export function parseOopKabinenCode(code: string): Kabine[] {
    const entries = [...code.matchAll(
        /kabine_(\d+)\s*=\s*Kabine\([^,]+,\s*(\d+),\s*tuer_offen\s*=\s*(true|false)\)/g
    )];

    return entries.map((m) => ({
        id: `kabine-${m[1]}`,
        currentEtage: parseInt(m[2], 10),
        doorsOpen: m[3] === 'true',
    }));
}

import type { Kabine } from "../../../../store/kabineSlice";

export function parseDeklarativKabinenCode(code: string): Kabine[] {
    const match = code.match(/kabinen\s*=\s*\[(.*?)\]/s);
    if (!match) return [];

    const inner = match[1];
    const entries = [...inner.matchAll(
        /{[^}]*"id":\s*(\d+),\s*"etage":\s*(\d+),\s*"tuer_offen":\s*(true|false)[^}]*}/g
    )];

    return entries.map((m) => ({
        id: `kabine-${m[1]}`,
        currentEtage: parseInt(m[2], 10),
        doorsOpen: m[3] === 'true',
    }));
}

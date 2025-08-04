import type { Kabine } from "../../../../store/kabineSlice";

export function parseDeklarativKabinenCode(code: string): Kabine[] {
    const blockMatch = code.match(/kabinen\s*=\s*\[(.*?)\]/s);
    if (!blockMatch) {
        return [];
    }
    const inner = blockMatch[1];
    const lines = inner
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const kabinen: Kabine[] = [];
    lines.forEach((line) => {
        const m = line.match(
            /^\{\s*"id"\s*:\s*(\d+),\s*"etage"\s*:\s*(\d+),\s*"tuer_offen"\s*:\s*(true|false)\s*\},?$/
        );
        if (!m) {
            throw new Error(
                `Ungültige Kabine in Zeile: "${line}". Erwartet: { "id": <Zahl>, "etage": <Zahl>, "tuer_offen": true|false }`
            );
        }
        kabinen.push({
            id: `kabine-${m[1]}`,
            currentEtage: parseInt(m[2], 10),
            doorsOpen: m[3] === 'true',
        });
    });

    return kabinen;
}

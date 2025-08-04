import type { Kabine } from "../../../../store/kabineSlice";

export function parseOopKabinenCode(code: string): Kabine[] {
    const lines = code
        .split('\n')
        .map((l) => l.trim())
        .filter((l) =>
            l.startsWith('kabine_') && l.includes('Kabine(')
        );

    const kabinen: Kabine[] = [];

    lines.forEach((line) => {
        const match = line.match(
            /^kabine_(\d+)\s*=\s*Kabine\((\d+),\s*(\d+),\s*tuer_offen\s*=\s*(true|false)\)$/i
        );
        if (!match) {
            throw new Error(
                `Ungültige Kabine in Zeile: "${line}". Erwartet: kabine_<n> = Kabine(id, etage, tuer_offen=true|false)`
            );
        }
        //@ts-ignore
        const [, idRaw, id, etage, tuerRaw] = match;

        kabinen.push({
            id: `kabine-${idRaw}`,
            currentEtage: parseInt(etage, 10),
            doorsOpen: tuerRaw.toLowerCase() === 'true',
        });
    });

    return kabinen;
}




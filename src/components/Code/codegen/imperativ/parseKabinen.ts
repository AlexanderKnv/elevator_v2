import type { Kabine } from "../../../../store/kabineSlice";

export function parseImperativKabinenCode(code: string): Kabine[] {
    const lines = code
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('kabine_'));

    const kabinenMap = new Map<
        string,
        { currentEtage?: number; doorsOpen?: boolean; originalLines: string[] }
    >();

    lines.forEach((line) => {
        const etageMatch = line.match(/^kabine_(\d+)_etage\s*=\s*(\d+)$/);
        const tuerMatch = line.match(/^kabine_(\d+)_tuer_offen\s*=\s*(true|false)$/i);

        if (etageMatch) {
            const id = etageMatch[1];
            const etage = parseInt(etageMatch[2], 10);
            const existing = kabinenMap.get(id) || { originalLines: [] };
            existing.currentEtage = etage;
            existing.originalLines.push(line);
            kabinenMap.set(id, existing);
            return;
        }

        if (tuerMatch) {
            const id = tuerMatch[1];
            const tuer = tuerMatch[2].toLowerCase() === 'true';
            const existing = kabinenMap.get(id) || { originalLines: [] };
            existing.doorsOpen = tuer;
            existing.originalLines.push(line);
            kabinenMap.set(id, existing);
            return;
        }

        throw new Error(
            `Ungültige Zeile: "${line}". Erwartet: kabine_<id>_etage oder _tuer_offen`
        );
    });

    const kabinen: Kabine[] = [];

    for (const [id, data] of kabinenMap.entries()) {
        if (data.currentEtage === undefined || data.doorsOpen === undefined) {
            throw new Error(
                `Unvollständige Definition für Kabine ${id}: ${data.originalLines.join(' | ')}`
            );
        }

        kabinen.push({
            id: `kabine-${id}`,
            currentEtage: data.currentEtage,
            doorsOpen: data.doorsOpen,
        });
    }

    return kabinen;
}



import type { Kabine } from "../../../../store/kabineSlice";

export function parseImperativKabinenCode(code: string): Kabine[] {
    const allLines = code
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const etageVarMap = new Map<string, number>();

    allLines.forEach((line) => {
        const match = line.match(/^etage_(\d+)\s*=\s*(\d+)$/);
        if (match) {
            const name = `etage_${match[1]}`;
            const nr = parseInt(match[2], 10);
            etageVarMap.set(name, nr);
        }
    });

    const kabinenLines = allLines.filter((l) => l.startsWith('kabine_'));

    const kabinenMap = new Map<
        string,
        { currentEtage?: number; doorsOpen?: boolean; originalLines: string[] }
    >();

    kabinenLines.forEach((line) => {
        const etageMatch = line.match(/^kabine_(\d+)_etage\s*=\s*(\d+|etage_\d+)$/);
        const tuerMatch = line.match(/^kabine_(\d+)_tuer_offen\s*=\s*(true|false)$/i);

        if (etageMatch) {
            const id = etageMatch[1];
            const rawEtage = etageMatch[2];
            let etageNum: number | undefined;

            if (/^\d+$/.test(rawEtage)) {
                etageNum = parseInt(rawEtage, 10);
            } else {
                etageNum = etageVarMap.get(rawEtage);
                if (etageNum === undefined) {
                    throw new Error(
                        `Unbekannte Etagenvariable "${rawEtage}"`
                    );
                }
            }

            const existing = kabinenMap.get(id) || { originalLines: [] };
            existing.currentEtage = etageNum;
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
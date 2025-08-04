import type { Kabine } from "../../../../store/kabineSlice";

export function parseOopKabinenCode(code: string): Kabine[] {
    const allLines = code
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const etageVarMap = new Map<string, number>();
    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];
        const match = line.match(/^etage_(\d+)\s*=\s*Etage\(\s*(\d+)\s*\)$/);
        if (match) {
            const varName = `etage_${match[1]}`;
            const nr = parseInt(match[2], 10);
            etageVarMap.set(varName, nr);
        }
    }

    const kabinen: Kabine[] = [];
    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];
        const match = line.match(
            /^kabine_(\d+)\s*=\s*Kabine\(\s*\d+\s*,\s*(\d+|etage_\d+)\s*,\s*tuer_offen\s*=\s*(true|false)\s*\)$/
        );

        if (!match) continue;

        const id = match[1];
        const etageRaw = match[2];
        const tuerRaw = match[3];

        let currentEtage: number | undefined;

        if (/^\d+$/.test(etageRaw)) {
            currentEtage = parseInt(etageRaw, 10);
        } else {
            currentEtage = etageVarMap.get(etageRaw);
            if (currentEtage === undefined) {
                throw new Error(
                    `Unbekannte Etagenvariable "${etageRaw}" in Zeile ${i + 1}`
                );
            }
        }

        const doorsOpen = tuerRaw.toLowerCase() === 'true';

        kabinen.push({
            id: `kabine-${id}`,
            currentEtage,
            doorsOpen,
        });
    }

    return kabinen;
}
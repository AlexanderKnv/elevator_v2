import type { Kabine } from "../../../../store/kabineSlice";

export function generateImperativKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen.length) return '';

    const lines = kabinen.map((kabine, i) => {
        const id = i + 1;

        const tuerLine = `kabine_${id}_tuer_offen = ${kabine.doorsOpen.toString()}`;
        const etageVar = `etage_${kabine.currentEtage}`;
        const etageLine = `kabine_${id}_etage = ${etageVar}`;

        return `${etageLine}\n${tuerLine}`;
    });

    return lines.join('\n\n');
}

import type { Kabine } from "../../../../store/kabineSlice";

export function generateOopKabinenCode(kabinen: Kabine[]): string {
    if (!kabinen.length) return '';

    const classDef = `
class Kabine:
    def __init__(self, id, etage, tuer_offen=False):
        self.id = id
        self.etage = etage
        self.tuer_offen = tuer_offen
`.trim();

    const instances = kabinen.map((kabine, index) => {
        const id = index + 1;
        const etageVar = `etage_${kabine.currentEtage}`;
        const tuer = kabine.doorsOpen ? 'true' : 'false';
        return `kabine_${id} = Kabine(${id}, ${etageVar}, tuer_offen=${tuer})`;
    });

    return `${classDef}\n\n${instances.join('\n')}`;
}
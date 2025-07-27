import type { Kabine } from "../../../../store/kabineSlice";

export function generateOopKabinenCode(kabinen: Kabine[]): string {
    if (kabinen.length === 0) return '';

    const instances = kabinen
        .map(
            (k) =>
                `kabine_${k.id.split('-')[1]} = Kabine(${k.id.split('-')[1]}, ${k.currentEtage}, tuer_offen=${k.doorsOpen})`
        )
        .join('\n');

    return [
        'class Kabine:',
        '    def __init__(self, id, etage, tuer_offen=False):',
        '        self.id = id',
        '        self.etage = etage',
        '        self.tuer_offen = tuer_offen',
        '',
        instances,
    ].join('\n');
}


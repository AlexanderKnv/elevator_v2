import { parseDeklarativEtagenCode } from './deklarativ/parseEtagen';
import { parseImperativEtagenCode } from './imperativ/parseEtagen';
import { parseOopEtagenCode } from './oop/parseEtagen';
import { parseDeklarativKabinenCode } from './deklarativ/parseKabinen';
import { parseImperativKabinenCode } from './imperativ/parseKabinen';
import { parseOopKabinenCode } from './oop/parseKabinen';
import type { Kabine } from '../../../store/kabineSlice';
import type { CodeStyle } from './codegen';
import type { RuftasteState } from '../../../store/ruftasteSlice';
import { parseDeklarativRuftasteCode } from './deklarativ/parseRuftasten';
import { parseImperativRuftasteCode } from './imperativ/parseRuftasten';
import { parseOopRuftasteCode } from './oop/parseRuftasten';
import { parseDeklarativAnzeigeCode } from './deklarativ/parseAnzeige';
import { parseImperativAnzeigeCode } from './imperativ/parseAnzeige';
import { parseOopAnzeigeCode } from './oop/parseAnzeige';
import type { AnzeigeState } from '../../../store/anzeigeSlice ';
import type { SchachtState } from '../../../store/schachtSlice';
import { parseDeklarativSchachtCode } from './deklarativ/parseSchacht';
import { parseImperativSchachtCode } from './imperativ/parseSchacht';
import { parseOopSchachtCode } from './oop/parseSchacht';

export function parseCode(
    style: CodeStyle,
    code: string
): { etagen: number[]; kabinen: Kabine[]; ruftasten: RuftasteState, anzeige: AnzeigeState, schacht: SchachtState } {
    switch (style) {
        case 'Deklarativ':
            return {
                etagen: parseDeklarativEtagenCode(code),
                kabinen: parseDeklarativKabinenCode(code),
                ruftasten: parseDeklarativRuftasteCode(code),
                anzeige: parseDeklarativAnzeigeCode(code),
                schacht: parseDeklarativSchachtCode(code),
            };
        case 'Imperativ':
            return {
                etagen: parseImperativEtagenCode(code),
                kabinen: parseImperativKabinenCode(code),
                ruftasten: parseImperativRuftasteCode(code),
                anzeige: parseImperativAnzeigeCode(code),
                schacht: parseImperativSchachtCode(code),
            };
        case 'OOP':
            return {
                etagen: parseOopEtagenCode(code),
                kabinen: parseOopKabinenCode(code),
                ruftasten: parseOopRuftasteCode(code),
                anzeige: parseOopAnzeigeCode(code),
                schacht: parseOopSchachtCode(code),
            };
        default:
            return {
                etagen: [],
                kabinen: [],
                ruftasten: { etagenMitRuftasten: [], aktiveRuftasten: [] },
                anzeige: { etagenMitAnzeige: [] },
                schacht: { etagenMitSchacht: [] },
            };
    }
}

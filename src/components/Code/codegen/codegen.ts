import type { AnzeigeState } from '../../../store/anzeigeSlice ';
import type { Kabine } from '../../../store/kabineSlice';
import type { RuftasteState } from '../../../store/ruftasteSlice';
import type { SchachtState } from '../../../store/schachtSlice';
import { generateDeklarativAnzeigeCode } from './deklarativ/anzeige';
import { generateDeklarativEtagenCode } from './deklarativ/etagen';
import { generateDeklarativKabinenCode } from './deklarativ/kabinen';
import { generateDeklarativRuftasteCode } from './deklarativ/ruftasten';
import { generateDeklarativSchachtCode } from './deklarativ/schacht';
import { generateImperativAnzeigeCode } from './imperativ/anzeige';
import { generateImperativEtagenCode } from './imperativ/etagen';
import { generateImperativKabinenCode } from './imperativ/kabinen';
import { generateImperativRuftasteCode } from './imperativ/ruftasten';
import { generateImperativSchachtCode } from './imperativ/schacht';
import { generateOopAnzeigeCode } from './oop/anzeige';
import { generateOopEtagenCode } from './oop/etagen';
import { generateOopKabinenCode } from './oop/kabinen';
import { generateOopRuftasteCode } from './oop/ruftasten';
import { generateOopSchachtCode } from './oop/schacht';

export type CodeStyle = 'Deklarativ' | 'Imperativ' | 'OOP';

export function generateCode(
    style: CodeStyle,
    etagen: number[],
    kabinen: Kabine[],
    ruftasten: RuftasteState,
    anzeige: AnzeigeState,
    schacht: SchachtState
): string {
    const WELCOME_LINE =
        'print("Willkommen in der Aufzugssimulation – viel Spaß beim Lernen!")';

    let etagenCode = '';
    let kabinenCode = '';
    let ruftastenCode = '';
    let anzeigenCode = '';
    let schachtCode = '';

    switch (style) {
        case 'Deklarativ':
            etagenCode = generateDeklarativEtagenCode(etagen);
            kabinenCode = generateDeklarativKabinenCode(kabinen);
            ruftastenCode = generateDeklarativRuftasteCode(
                ruftasten.etagenMitRuftasten,
                ruftasten.aktiveRuftasten
            );
            anzeigenCode = generateDeklarativAnzeigeCode(anzeige);
            schachtCode = generateDeklarativSchachtCode(schacht);
            break;
        case 'Imperativ':
            etagenCode = generateImperativEtagenCode(etagen);
            kabinenCode = generateImperativKabinenCode(kabinen);
            ruftastenCode = generateImperativRuftasteCode(
                ruftasten.etagenMitRuftasten,
                ruftasten.aktiveRuftasten
            );
            anzeigenCode = generateImperativAnzeigeCode(anzeige);
            schachtCode = generateImperativSchachtCode(schacht);
            break;
        case 'OOP':
            etagenCode = generateOopEtagenCode(etagen);
            kabinenCode = generateOopKabinenCode(kabinen);
            ruftastenCode = generateOopRuftasteCode(
                ruftasten.etagenMitRuftasten,
                ruftasten.aktiveRuftasten
            );
            anzeigenCode = generateOopAnzeigeCode(anzeige);
            schachtCode = generateOopSchachtCode(schacht);
            break;
    }

    const codeBody = [etagenCode, kabinenCode, ruftastenCode, anzeigenCode, schachtCode].filter(Boolean).join('\n\n');

    return codeBody.trim() === '' ? WELCOME_LINE : codeBody;
}

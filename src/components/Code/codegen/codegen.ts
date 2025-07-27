import type { Kabine } from '../../../store/kabineSlice';
import { generateDeklarativEtagenCode } from './deklarativ/etagen';
import { generateDeklarativKabinenCode } from './deklarativ/kabinen';
import { generateImperativEtagenCode } from './imperativ/etagen';
import { generateImperativKabinenCode } from './imperativ/kabinen';
import { generateOopEtagenCode } from './oop/etagen';
import { generateOopKabinenCode } from './oop/kabinen';

export type CodeStyle = 'Deklarativ' | 'Imperativ' | 'OOP';

export function generateCode(
  style: CodeStyle,
  etagen: number[],
  kabinen: Kabine[]
): string {
  const WELCOME_LINE =
    'print("Willkommen in der Aufzugssimulation – viel Spaß beim Lernen!")';

  let etagenCode = '';
  let kabinenCode = '';

  switch (style) {
    case 'Deklarativ':
      etagenCode = generateDeklarativEtagenCode(etagen);
      kabinenCode = generateDeklarativKabinenCode(kabinen);
      break;
    case 'Imperativ':
      etagenCode = generateImperativEtagenCode(etagen);
      kabinenCode = generateImperativKabinenCode(kabinen);
      break;
    case 'OOP':
      etagenCode = generateOopEtagenCode(etagen);
      kabinenCode = generateOopKabinenCode(kabinen);
      break;
  }

  const codeBody = [etagenCode, kabinenCode].filter(Boolean).join('\n\n');

  return codeBody.trim() === '' ? WELCOME_LINE : codeBody;
}

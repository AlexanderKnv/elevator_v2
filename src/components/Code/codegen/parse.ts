import { parseDeklarativEtagenCode } from './deklarativ/parseEtagen';
import { parseImperativEtagenCode } from './imperativ/parseEtagen';
import { parseOopEtagenCode } from './oop/parseEtagen';

import { parseDeklarativKabinenCode } from './deklarativ/parseKabinen';
import { parseImperativKabinenCode } from './imperativ/parseKabinen';
import { parseOopKabinenCode } from './oop/parseKabinen';

import type { Kabine } from '../../../store/kabineSlice';
import type { CodeStyle } from './codegen';

export function parseCode(
  style: CodeStyle,
  code: string
): { etagen: number[]; kabinen: Kabine[] } {
  switch (style) {
    case 'Deklarativ':
      return {
        etagen: parseDeklarativEtagenCode(code),
        kabinen: parseDeklarativKabinenCode(code),
      };
    case 'Imperativ':
      return {
        etagen: parseImperativEtagenCode(code),
        kabinen: parseImperativKabinenCode(code),
      };
    case 'OOP':
      return {
        etagen: parseOopEtagenCode(code),
        kabinen: parseOopKabinenCode(code),
      };
    default:
      return { etagen: [], kabinen: [] };
  }
}

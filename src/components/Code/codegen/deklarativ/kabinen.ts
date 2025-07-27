import type { Kabine } from "../../../../store/kabineSlice";

export function generateDeklarativKabinenCode(kabinen: Kabine[]): string {
  if (kabinen.length === 0) return '';

  const list = kabinen
    .map(
      (k) =>
        `    { "id": ${k.id.split('-')[1]}, "etage": ${k.currentEtage}, "tuer_offen": ${k.doorsOpen} }`
    )
    .join(',\n');

  return `kabinen = [\n${list}\n]`;
}

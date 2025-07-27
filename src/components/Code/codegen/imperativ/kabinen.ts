import type { Kabine } from "../../../../store/kabineSlice";

export function generateImperativKabinenCode(kabinen: Kabine[]): string {
  if (kabinen.length === 0) return '';

  return kabinen
    .map(
      (k) =>
        `# Kabine ${k.id}\n` +
        `kabine_${k.id.split('-')[1]}_etage = ${k.currentEtage}\n` +
        `kabine_${k.id.split('-')[1]}_tuer_offen = ${k.doorsOpen}`
    )
    .join('\n\n');
}

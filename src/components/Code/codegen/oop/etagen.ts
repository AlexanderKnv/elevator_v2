export function generateOopEtagenCode(etagen: number[]): string {
  if (etagen.length === 0) return '';

  return [
    'class Etage:',
    '    def __init__(self, nr):',
    '        self.nr = nr',
    '',
    ...etagen.map((nr) => `etage_${nr} = Etage(${nr})`)
  ].join('\n');
}

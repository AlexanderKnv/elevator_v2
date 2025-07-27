export function generateImperativEtagenCode(etagen: number[]): string {
    if (etagen.length === 0) return '';

    return etagen.map((nr) => `etage_${nr} = ${nr}`).join('\n');
}

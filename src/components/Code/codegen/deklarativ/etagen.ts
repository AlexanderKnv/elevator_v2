export function generateDeklarativEtagenCode(etagen: number[]): string {
    if (etagen.length === 0) return '';

    const list = etagen.map((nr) => `    { "nr": ${nr} }`).join(',\n');
    return `etagen = [\n${list}\n]`;
}


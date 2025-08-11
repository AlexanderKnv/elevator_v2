export function generateDeklarativAnzeigeCode(etagenMitAnzeige: number[]): string {
    if (!etagenMitAnzeige.length) return '';

    const list = etagenMitAnzeige
        .map((nr) => `    { "etagenMitAnzeige": ${nr} }`)
        .join(',\n');

    return `anzeige = [\n${list}\n]`;
}
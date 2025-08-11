export function generateImperativAnzeigeCode(etagenMitAnzeige: number[]): string {
    if (!etagenMitAnzeige || etagenMitAnzeige.length === 0) return "";

    const uniqSorted = Array.from(new Set(etagenMitAnzeige)).sort((a, b) => a - b);
    const items = uniqSorted.map((n) => `etage_${n}`).join(", ");

    return `anzeige_etagen = [${items}]`;
}

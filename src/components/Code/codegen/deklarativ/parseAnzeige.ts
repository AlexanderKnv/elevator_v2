export function parseDeklarativAnzeigeCode(code: string): { etagenMitAnzeige: number[] } {
    const match = code.match(/anzeige\s*=\s*\[(.*?)\]/s);
    if (!match) return { etagenMitAnzeige: [] };

    const inner = match[1];
    const lines = inner
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const etagenMitAnzeige: number[] = [];

    lines.forEach((line) => {
        const m = line.match(/^\{\s*"etagenMitAnzeige"\s*:\s*(\d+)\s*\},?$/);
        if (!m) {
            throw new Error(
                `Ungültige Anzeige-Zeile: "${line}". Erwartet: { "etagenMitAnzeige": <Zahl> }`
            );
        }

        const nr = parseInt(m[1], 10);
        if (nr < 1 || nr > 3) {
            throw new Error(
                `Ungültige Etage ${nr} für Anzeige. Erlaubt sind nur Werte 1–3.`
            );
        }

        etagenMitAnzeige.push(nr);
    });

    return { etagenMitAnzeige };
}

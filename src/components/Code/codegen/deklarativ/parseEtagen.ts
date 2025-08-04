export function parseDeklarativEtagenCode(code: string): number[] {
    const blockMatch = code.match(/etagen\s*=\s*\[(.*?)\]/s);
    if (!blockMatch) {
        throw new Error('Block "etagen = [...]" nicht gefunden.');
    }
    const inner = blockMatch[1];
    const lines = inner
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length === 0) {
        return [];
    }

    const etagen: number[] = [];
    lines.forEach((line) => {
        const m = line.match(/^\{\s*"nr"\s*:\s*(\d+)\s*\},?$/);
        if (!m) {
            throw new Error(
                `Ungültige Etage in Zeile: "${line}". Erwartet: { "nr": <Zahl> }`
            );
        }
        etagen.push(parseInt(m[1], 10));
    });

    return etagen;
}
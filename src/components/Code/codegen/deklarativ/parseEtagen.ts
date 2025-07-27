export function parseDeklarativEtagenCode(code: string): number[] {
    const etagenMatch = code.match(/etagen\s*=\s*\[(.*?)\]/s);
    if (!etagenMatch) throw new Error("etagen = [...] nicht gefunden");

    const inner = etagenMatch[1];
    const matches = [...inner.matchAll(/"nr":\s*(\d+)/g)];

    if (matches.length === 0) throw new Error("Keine gültige Etagen gefunden");

    return matches.map((m) => parseInt(m[1], 10));
}


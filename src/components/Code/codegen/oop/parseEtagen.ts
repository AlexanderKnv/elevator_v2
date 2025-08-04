export function parseOopEtagenCode(code: string): number[] {
    const lines = code
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && l.startsWith('etage_'));

    const etagen = new Set<number>();

    lines.forEach((line) => {
        const match = line.match(/^etage_\d+\s*=\s*Etage\((\d+)\)/);

        if (!match) {
            throw new Error(
                `Ungültige Etage in Zeile: "${line}". Erwartet: etage_<id> = Etage(<Zahl>)`
            );
        }

        etagen.add(parseInt(match[1], 10));
    });

    return Array.from(etagen).sort((a, b) => a - b);
}
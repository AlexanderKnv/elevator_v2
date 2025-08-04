export function parseImperativEtagenCode(code: string): number[] {
    const lines = code
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('etage_'));

    const etagen: number[] = [];
    lines.forEach((line) => {
        const m = line.match(/^etage_\d+\s*=\s*(\d+)$/);
        if (!m) {
            throw new Error(
                `Ungültige Etage in Zeile: "${line}". Erwartet: etage_<id> = <Zahl>`
            );
        }
        etagen.push(parseInt(m[1], 10));
    });

    return etagen;
}


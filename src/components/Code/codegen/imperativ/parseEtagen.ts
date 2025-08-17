export function parseImperativEtagenCode(code: string): number[] {
    const etagen: number[] = [];

    const lines = code
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.startsWith("etage_"));

    if (lines.length === 0) return [];

    lines.forEach((line, idx) => {
        const m = line.match(/^etage_(\d+)\s*=\s*(\d+)$/);
        if (!m) {
            throw new Error(
                `Ungültige Etage in Zeile ${idx + 1}: "${line}". Erwartet: etage_<nr> = <nr>`
            );
        }

        const id = parseInt(m[1], 10);
        const nr = parseInt(m[2], 10);

        if (id !== nr) {
            throw new Error(
                `Ungültige Etage: "etage_${id} = ${nr}". Erwartet: etage_<nr> = <nr>`
            );
        }

        if (etagen.includes(nr)) {
            throw new Error(`Doppelte Etage gefunden: "${nr}".`);
        }

        if (nr < 1 || nr > 3) {
            throw new Error(
                `Ungültige Etage "${nr}". Nur Werte 1 bis 3 sind erlaubt.`
            );
        }

        etagen.push(nr);
    });

    if (etagen.length > 3) {
        throw new Error(
            `Zu viele Etagen definiert (${etagen.length}). Maximal sind 3 erlaubt.`
        );
    }

    return etagen;
}


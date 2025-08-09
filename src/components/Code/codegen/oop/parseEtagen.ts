export function parseOopEtagenCode(code: string): number[] {
    const re = /^\s*etage_(\d+)\s*=\s*Etage\s*\(\s*(\d+)\s*\)\s*$/gm;
    const seen: number[] = [];
    let m: RegExpExecArray | null;

    while ((m = re.exec(code)) !== null) {
        const varId = parseInt(m[1], 10);
        const nr = parseInt(m[2], 10);

        if (varId !== nr) {
            throw new Error(`Ungültige Etage: etage_${varId} muss Etage(${varId}) sein.`);
        }
        if (nr < 1 || nr > 3) {
            throw new Error(`Etage ${nr} liegt außerhalb des Bereichs 1..3.`);
        }
        if (seen.includes(nr)) {
            throw new Error(`Doppelte Etage: ${nr}.`);
        }
        seen.push(nr);
    }

    // Никаких объявлений — значит этажи пусты (и это не ошибка)
    return seen.sort((a, b) => a - b);
}
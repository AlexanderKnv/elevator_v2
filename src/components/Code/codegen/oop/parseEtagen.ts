import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseOopEtagenCode(code: string): number[] {
    const text = stripHashComments(code);

    const re = /^\s*etage_(\d+)\s*=\s*Etage\s*\(\s*(\d+)\s*\)\s*$/gm;

    const seen = new Set<number>();
    const out: number[] = [];
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
        const varId = parseInt(m[1], 10);
        const nr = parseInt(m[2], 10);

        if (varId !== nr) {
            throw new Error(`Ungültige Etage: etage_${varId} muss Etage(${varId}) sein.`);
        }

        checkEtageRange(nr, "nr");

        if (seen.has(nr)) {
            throw new Error(`Doppelte Etage: ${nr}.`);
        }
        seen.add(nr);
        out.push(nr);
    }

    return out.sort((a, b) => a - b);
}

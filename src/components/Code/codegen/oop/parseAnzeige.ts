import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseOopAnzeigeCode(code: string): { etagenMitAnzeige: number[] } {
    const text = stripHashComments(code);

    const re = /^\s*anzeige_panel_(\d+)\s*=\s*AnzeigePanel\s*\(\s*etage_(\d+)\s*\)\s*$/gm;

    const seen = new Set<number>();
    const out: number[] = [];
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
        const varNum = parseInt(m[1], 10);
        const etageNum = parseInt(m[2], 10);

        if (varNum !== etageNum) {
            throw new Error(`Ungültiges Anzeige-Panel: anzeige_panel_${varNum} muss AnzeigePanel(etage_${varNum}) sein.`);
        }

        checkEtageRange(etageNum, "etage");

        if (seen.has(etageNum)) {
            throw new Error(`Doppelte Anzeige-Panel-Definition für Etage ${etageNum}.`);
        }
        seen.add(etageNum);
        out.push(etageNum);
    }

    return { etagenMitAnzeige: out.sort((a, b) => a - b) };
}

import { stripHashComments, extractBracketInner } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseImperativAnzeigeCode(code: string): { etagenMitAnzeige: number[] } {
    const text = stripHashComments(code);

    const re = /anzeige_etagen\s*=\s*\[/s;
    if (!re.test(text)) return { etagenMitAnzeige: [] };

    const inner = extractBracketInner(text, /anzeige_etagen\s*=\s*\[/s, "[", "]").trim();
    if (!inner) return { etagenMitAnzeige: [] };

    const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);
    const etageVarRe = /^etage_(\d+)$/i;
    const seen = new Set<number>();
    const out: number[] = [];

    parts.forEach((p) => {
        const m = p.match(etageVarRe);
        if (!m) throw new Error(`anzeige_etagen: Ungültiger Eintrag "${p}" (erwartet etage_<n>).`);
        const n = parseInt(m[1], 10);
        checkEtageRange(n, "etage");
        if (seen.has(n)) throw new Error(`anzeige_etagen: doppelte Etage ${n}.`);
        seen.add(n);
        out.push(n);
    });

    out.sort((a, b) => a - b);
    return { etagenMitAnzeige: out };
}

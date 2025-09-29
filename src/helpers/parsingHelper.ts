/** @packageDocumentation
 * # Parser-/String-Helper (`parseHelpers.ts`)
 *
 * Hilfsfunktionen zum **Vorbereiten**, **Extrahieren** und **Zerlegen** von
 * Python-/JSON-ähnlichen Texten (Normalisierung von Literalen, Entfernen von
 * Kommentaren, Balancieren von Klammern, Splitten auf Top-Level).
 * 
 * - `normalizePyBooleansNone` wandelt `True/False/None` → `true/false/null` (word-boundaries).
 * - `stripHashComments` entfernt Zeilen, die (ggf. mit Whitespace) mit `#` beginnen.
 * - `stripTrailingCommas` löscht **abschließende** Kommata vor `}` bzw. `]`.
 * - `extractBracketInner` findet ab `startRegex` den **balancierten** Inhalt zwischen `open`/`close`
 *   (Default: `[`/`]`); wirft Fehler, wenn nicht gefunden oder **unausgeglichen**.
 * - `tryExtractBracketInner` wie oben, gibt bei **nicht gefunden** `null` zurück; unausgeglichen → Fehler.
 * - `splitTopLevelObjects` splittet einen String in einzelne **Top-Level-Objekte** `{...}` auf Basis
 *   der geschweiften Klammer-Tiefe.
 * - `splitArgs` zerlegt einen Argument-Body auf Kommata, berücksichtigt **verschachtelte** `()` und `[]`.
 * - `readIntAssign` liest `name = <int>` am Zeilenanfang; gibt `number` oder `null` zurück.
 */

export const normalizePyBooleansNone = (s: string) =>
    s.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null");

export const stripHashComments = (s: string) => s.replace(/^\s*#.*$/gm, "");
export const stripTrailingCommas = (s: string) => s.replace(/,\s*([}\]])/g, "$1");

export function extractBracketInner(code: string, startRegex: RegExp, open = "[", close = "]"): string {
    const m = code.match(startRegex);
    if (!m) throw new Error(`Block nicht gefunden: ${startRegex}`);
    let i = (m.index ?? 0) + m[0].length, depth = 1;
    while (i < code.length && depth > 0) {
        const ch = code[i];
        if (ch === open) depth++;
        else if (ch === close) depth--;
        i++;
    }
    if (depth !== 0) throw new Error(`Unausgeglichene Klammerung für Block: ${startRegex}`);
    const start = (m.index ?? 0) + m[0].length;
    const end = i - 1;
    return code.slice(start, end);
}

export function tryExtractBracketInner(
    code: string,
    startRegex: RegExp,
    open = "[",
    close = "]"
): string | null {
    const m = code.match(startRegex);
    if (!m) return null;
    let i = (m.index ?? 0) + m[0].length, depth = 1;
    while (i < code.length && depth > 0) {
        const ch = code[i];
        if (ch === open) depth++;
        else if (ch === close) depth--;
        i++;
    }
    if (depth !== 0) throw new Error(`Unausgeglichene Klammerung für Block: ${startRegex}`);
    const start = (m.index ?? 0) + m[0].length;
    const end = i - 1;
    return code.slice(start, end);
}

export function splitTopLevelObjects(inner: string): string[] {
    const out: string[] = [];
    let depth = 0, start = -1;
    for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (ch === "{") { if (depth === 0) start = i; depth++; }
        else if (ch === "}") { depth--; if (depth === 0 && start !== -1) { out.push(inner.slice(start, i + 1)); start = -1; } }
    }
    return out;
}

export function splitArgs(argsBody: string): string[] {
    const out: string[] = [];
    let buf = "", depthParen = 0, depthBracket = 0;
    for (let i = 0; i < argsBody.length; i++) {
        const ch = argsBody[i];
        if (ch === "(") depthParen++;
        else if (ch === ")") depthParen--;
        else if (ch === "[") depthBracket++;
        else if (ch === "]") depthBracket--;
        if (ch === "," && depthParen === 0 && depthBracket === 0) { out.push(buf.trim()); buf = ""; }
        else { buf += ch; }
    }
    if (buf.trim()) out.push(buf.trim());
    return out;
}

export function readIntAssign(line: string, name: string): number | null {
    const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(\\d+)\\b`));
    return m ? parseInt(m[1], 10) : null;
}

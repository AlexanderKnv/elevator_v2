/** @packageDocumentation
 * # Python-Formatter/Renderer (Hilfsfunktionen)
 *
 * Sammlung von kleinen Utilities, um Werte und Strukturen als **Python-ähnliche**
 * oder **JSON-ähnliche** Strings zu serialisieren.
 *
 * - Deklarativer Stil (JSON-ähnlich, `true/false/null`, Arrays in `[...]`).
 * - Imperativ/OOP-Stil (Variablennamen wie `etage_<n>`, `True/False/None`).
 * - Rendern globaler Einstellungen als einfache Zuweisungen in Mehrzeilen-Strings.
 */

export const pyBool = (b: boolean) => (b ? "true" : "false");
export const pyNullNum = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "null" : String(n));
export const pyNullStr = (s: string | null | undefined) => (s == null ? "null" : `"${s}"`);
export const pyNumArray = (nums: number[]) => `[${nums.map(String).join(", ")}]`;

export const pyBoolTF = (b: boolean) => (b ? "True" : "False");
export const etageVar = (n: number) => `etage_${n}`;
export const etageVarOrNone = (n: number | null | undefined) => (n == null ? "None" : etageVar(n));
export const etageVarArray = (nums: number[]) => `[${nums.map(etageVar).join(", ")}]`;
export const pyNoneOrQuoted = (s: string | null | undefined) => (s == null ? "None" : `"${s}"`);

export const renderGlobals = (speedMs: number, doorTimeMs: number) =>
    `Kabinen_Wartezeit = ${speedMs}\nTür_Öffnungs_Zeit = ${doorTimeMs}`;

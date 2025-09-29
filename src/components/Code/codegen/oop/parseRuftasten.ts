/** @packageDocumentation
 * # OOP-Parser: Ruftasten (`parseOopRuftasteCode`)
 *
 * - Entfernt `#`-Kommentare und sucht Panel-Definitionen `panel_<n> = RuftastenPanel(etage_<n>)`.
 * - Prüft Konsistenz von Variablenname und Konstruktor-Argument, validiert Etagenbereich (1–3), verhindert doppelte Panels.
 * - Baut `etagenMitRuftasten` aus gefundenen Panels und sortiert aufsteigend.
 * - Parst optional `aktive_ruftasten = [ AktiverRuf(panel_<n>, "up"|"down"), ... ]`; validiert Panel-Referenzen und verhindert doppelte (Etage,Richtung)-Paare.
 * - Sortiert aktive Rufe nach Etage und innerhalb der Etage `'up'` vor `'down'` und gibt `{ etagenMitRuftasten, aktiveRuftasten }` zurück.
 */

import type { Richtung } from "../../../../store/ruftasteSlice";
import { stripHashComments, extractBracketInner, splitArgs } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseOopRuftasteCode(code: string): {
    etagenMitRuftasten: number[];
    aktiveRuftasten: { etage: number; callDirection: Richtung }[];
} {
    const text = stripHashComments(code);

    const panelRe = /^\s*panel_(\d+)\s*=\s*RuftastenPanel\s*\(\s*(etage_(\d+))\s*\)\s*$/gm;
    const panels = new Map<number, string>();
    const etagenSet = new Set<number>();

    let pm: RegExpExecArray | null;
    while ((pm = panelRe.exec(text)) !== null) {
        const varNum = parseInt(pm[1], 10);
        const etageNum = parseInt(pm[3], 10);

        if (varNum !== etageNum) {
            throw new Error(`Ungültiges Panel: panel_${varNum} muss RuftastenPanel(etage_${varNum}) sein.`);
        }
        checkEtageRange(etageNum, "etage");

        if (etagenSet.has(etageNum)) {
            throw new Error(`Doppelte Panel-Definition für Etage ${etageNum}.`);
        }
        etagenSet.add(etageNum);
        panels.set(etageNum, `panel_${varNum}`);
    }

    const etagenMitRuftasten = Array.from(etagenSet).sort((a, b) => a - b);

    const aktiveExists = /aktive_ruftasten\s*=\s*\[/s.test(text);
    const aktiveRuftasten: { etage: number; callDirection: Richtung }[] = [];
    if (aktiveExists) {
        const inner = extractBracketInner(text, /aktive_ruftasten\s*=\s*\[/s, "[", "]").trim();
        if (inner) {
            const items = splitArgs(inner).map(s => s.trim()).filter(Boolean);

            const seenPairs = new Set<string>();
            for (let i = 0; i < items.length; i++) {
                const it = items[i];

                const m = it.match(/^\s*AktiverRuf\s*\(\s*(panel_(\d+))\s*,\s*"(up|down)"\s*\)\s*$/i);
                if (!m) {
                    throw new Error(`aktive_ruftasten #${i + 1}: Ungültiges Element: "${it}". Erwartet: AktiverRuf(panel_<n>, "up"|"down").`);
                }
                const panelName = m[1];
                const panelNum = parseInt(m[2], 10);
                const dir = m[3].toLowerCase() as Richtung;

                if (!panels.has(panelNum)) {
                    throw new Error(`aktive_ruftasten #${i + 1}: Referenz auf nicht definiertes Panel ${panelName}.`);
                }

                checkEtageRange(panelNum, "etage");
                const key = `${panelNum}|${dir}`;
                if (seenPairs.has(key)) {
                    throw new Error(`aktive_ruftasten: doppelter Eintrag für Etage ${panelNum} und Richtung "${dir}".`);
                }
                seenPairs.add(key);

                aktiveRuftasten.push({ etage: panelNum, callDirection: dir });
            }

            aktiveRuftasten.sort(
                (a, b) =>
                    a.etage - b.etage ||
                    (a.callDirection === "up" && b.callDirection === "down" ? -1 :
                        a.callDirection === b.callDirection ? 0 : 1)
            );
        }
    }

    return { etagenMitRuftasten, aktiveRuftasten };
}

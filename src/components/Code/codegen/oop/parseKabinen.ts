/** @packageDocumentation
 * # OOP-Parser: Kabinen (`parseOopKabinenCode`)
 *
 * - Entfernt `#`-Kommentare und findet Blöcke `kabine_(left|right) = Kabine(...)`.
 * - Zerlegt die Argumentliste robust mit `splitTopLevelArgs` (beachtet Klammer-Tiefe `[]`, Strings, Kommas auf Top-Level); erwartet **genau 10** Argumente.
 * - Liest/prüft Felder:
 *   - `id` (String) und `side` (`"left"|"right"`), erzwingt `id === "kabine-<side>"`, verbietet doppelte Seiten.
 *   - `current_etage = etage_<n>` (1..3), `target_etage = None|null|etage_<n>` (1..3), Konsistenz via `checkEtageRange`.
 *   - `is_moving`, `tuer_offen` als `True|False` (case-insensitive).
 *   - `call_queue`, `aktive_ziel_etagen` als `[etage_<n>, ...]` ohne Duplikate, alle Werte 1..3.
 *   - `direction_movement = None|null|"up"|"down"`.
 * - Baut `Kabine`-Objekte und leitet `doorsState` aus `tuer_offen` ab (`open`/`closed`); maximal **2** Kabinen erlaubt.
 * - Sortiert Ergebnis deterministisch: `side` (left vor right), dann `id`.
 */

import type { Kabine, KabineSide } from "../../../../store/kabineSlice";
import { stripHashComments } from "../../../../helpers/parsingHelper";
import { checkEtageRange } from "../../../../helpers/validationHelper";

export function parseOopKabinenCode(code: string): Kabine[] {
    const text = stripHashComments(code);

    const re = /kabine_(left|right)\s*=\s*Kabine\s*\(\s*([\s\S]*?)\)/g;
    const results: Kabine[] = [];
    const usedSides = new Set<KabineSide>();

    let m: RegExpExecArray | null;
    let blockIdx = 0;

    while ((m = re.exec(text)) !== null) {
        blockIdx += 1;
        const sideFromVar = m[1] as KabineSide;
        const argsStr = m[2].trim();

        const args = splitTopLevelArgs(argsStr);
        if (args.length !== 10) {
            throw new Error(
                `Kabine ${blockIdx}: Erwartet 10 Argumente im Aufruf Kabine(...), gefunden ${args.length}.`
            );
        }

        const id = readQuoted(args[0], `Kabine ${blockIdx}: Feld "id" muss String sein (z.B. "kabine-left").`);

        const sideStr = readQuoted(args[1], `Kabine ${blockIdx}: Feld "side" muss "left" oder "right" sein.`);
        if (sideStr !== "left" && sideStr !== "right") {
            throw new Error(`Kabine ${blockIdx}: Feld "side" muss "left" oder "right" sein (gefunden "${sideStr}").`);
        }
        const side = sideStr as KabineSide;

        if (side !== sideFromVar) {
            throw new Error(
                `Kabine ${blockIdx}: Variablenname "kabine_${sideFromVar}" widerspricht side="${side}".`
            );
        }
        if (id !== `kabine-${side}`) {
            throw new Error(
                `Kabine ${blockIdx}: "id" muss "kabine-${side}" sein (gefunden "${id}").`
            );
        }
        if (usedSides.has(side)) {
            throw new Error(`Doppelte Kabine für Seite "${side}".`);
        }
        usedSides.add(side);

        const currentEtage = readEtageVar(args[2], `Kabine ${blockIdx}: "current_etage" muss etage_<n> sein.`);
        checkEtageRange(currentEtage, "current_etage", blockIdx);

        const targetEtage = readEtageVarOrNone(args[3], `Kabine ${blockIdx}: "target_etage" muss None/null oder etage_<n> sein.`);
        if (targetEtage !== null) checkEtageRange(targetEtage, "target_etage", blockIdx);

        const isMoving = readBool(args[4], `Kabine ${blockIdx}: "is_moving" muss True/False sein.`);

        const doorsOpen = readBool(args[5], `Kabine ${blockIdx}: "tuer_offen" muss True/False sein.`);

        const callQueue = readEtageVarArray(args[6], `Kabine ${blockIdx}: "call_queue" muss Liste von etage_<n> sein.`);
        callQueue.forEach((n) => checkEtageRange(n, "call_queue", blockIdx));

        const directionMovement = readDirection(args[7], `Kabine ${blockIdx}: "direction_movement" muss None/null oder "up"/"down" sein.`);

        const hasBedienpanel = readBool(args[8], `Kabine ${blockIdx}: "has_bedienpanel" muss True/False sein.`);

        const aktiveZielEtagen = readEtageVarArray(args[9], `Kabine ${blockIdx}: "aktive_ziel_etagen" muss Liste von etage_<n> sein.`);
        aktiveZielEtagen.forEach((n) => checkEtageRange(n, "aktive_ziel_etagen", blockIdx));

        results.push({
            id,
            side,
            currentEtage,
            targetEtage,
            isMoving,
            doorsOpen,
            callQueue,
            directionMovement,
            hasBedienpanel,
            aktiveZielEtagen,
            doorsState: doorsOpen ? "open" : "closed",
        });
    }

    if (results.length > 2) {
        throw new Error(`Zu viele Kabinen gefunden (${results.length}). Maximal 2 (left & right).`);
    }

    return results.sort((a, b) => (a.side === b.side ? a.id.localeCompare(b.id) : a.side === "left" ? -1 : 1));
}

function splitTopLevelArgs(s: string): string[] {
    const out: string[] = [];
    let cur = "";
    let depth = 0;
    let inStr = false;
    let quote: '"' | "'" | null = null;

    for (let i = 0; i < s.length; i++) {
        const ch = s[i];

        if (inStr) {
            cur += ch;
            if (ch === quote && s[i - 1] !== "\\") {
                inStr = false;
                quote = null;
            }
            continue;
        }

        if (ch === '"' || ch === "'") {
            inStr = true;
            quote = ch as '"' | "'";
            cur += ch;
            continue;
        }

        if (ch === "[") { depth++; cur += ch; continue; }
        if (ch === "]") { depth--; cur += ch; continue; }

        if (ch === "," && depth === 0) {
            if (cur.trim() !== "") out.push(cur.trim());
            cur = "";
            continue;
        }

        cur += ch;
    }

    if (cur.trim() !== "") out.push(cur.trim());
    return out;
}

function readQuoted(token: string, err: string): string {
    const m = token.match(/^\s*"(.*)"\s*$/s) || token.match(/^\s*'(.*)'\s*$/s);
    if (!m) throw new Error(err);
    return m[1];
}

function readBool(token: string, err: string): boolean {
    const v = token.trim();
    if (/^(True|true)$/.test(v)) return true;
    if (/^(False|false)$/.test(v)) return false;
    throw new Error(err);
}

function readEtageVar(token: string, err: string): number {
    const m = token.trim().match(/^etage_(\d+)$/i);
    if (!m) throw new Error(err);
    return parseInt(m[1], 10);
}

function readEtageVarOrNone(token: string, err: string): number | null {
    const t = token.trim();
    if (/^(None|null)$/i.test(t)) return null;
    return readEtageVar(t, err);
}

function readEtageVarArray(token: string, err: string): number[] {
    const t = token.trim();
    const m = t.match(/^\[(.*)\]$/s);
    if (!m) throw new Error(err);
    const inner = m[1].trim();
    if (inner === "") return [];
    const parts = splitTopLevelArgs(inner);
    const out: number[] = [];
    const seen = new Set<number>();
    for (const p of parts) {
        const n = readEtageVar(p, err);
        if (seen.has(n)) throw new Error(`${err} (Duplikat etage_${n}).`);
        seen.add(n);
        out.push(n);
    }
    return out;
}

function readDirection(token: string, err: string): "up" | "down" | null {
    const t = token.trim();
    if (/^(None|null)$/i.test(t)) return null;
    const m = t.match(/^"(up|down)"$/i) || t.match(/^'(up|down)'$/i);
    if (!m) throw new Error(err);
    return m[1].toLowerCase() as "up" | "down";
}
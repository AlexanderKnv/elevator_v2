/** @packageDocumentation
 * # Deklarativ-Parser: Etagen (`parseDeklarativEtagenCode`)
 *
 * - Sucht den Block `etagen = [ ... ]`; fehlt der Block → Rückgabe `[]`.
 * - Extrahiert den Listeninhalt zeilenweise und erwartet `{ "nr": <Zahl> }` (Komma am Zeilenende erlaubt).
 * - Validiert jede Etage: Wertebereich **1–3**, keine Duplikate.
 * - Prüft Obergrenze: maximal **3** Etagen insgesamt.
 * - Wirft verständliche Fehler bei falschem Format, Doppelten oder ungültigen Werten.
 * - Gibt die gefundenen Etagen als `number[]` in Eingabereihenfolge zurück.
 */

export function parseDeklarativEtagenCode(code: string): number[] {
    const blockMatch = code.match(/etagen\s*=\s*\[(.*?)\]/s);
    const etagen: number[] = [];

    if (blockMatch) {
        const inner = blockMatch[1];
        const lines = inner
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

        if (lines.length === 0) {
            return [];
        }

        lines.forEach((line, idx) => {
            const m = line.match(/^\{\s*"nr"\s*:\s*(\d+)\s*\},?$/);
            if (!m) {
                throw new Error(
                    `Ungültige Etage in Zeile: "${line}". Erwartet: { "nr": <Zahl> }`
                );
            }
            const nr = parseInt(m[1], 10);

            if (etagen.includes(nr)) {
                throw new Error(
                    `Doppelte Etage gefunden: "${nr}" (Zeile ${idx + 1}).`
                );
            }

            if (nr < 1 || nr > 3) {
                throw new Error(
                    `Ungültige Etage "${nr}" in Zeile ${idx + 1}. Nur Werte 1 bis 3 sind erlaubt.`
                );
            }

            etagen.push(nr);
        });

        if (etagen.length > 3) {
            throw new Error(
                `Zu viele Etagen definiert (${etagen.length}). Maximal sind 3 erlaubt.`
            );
        }
    }

    return etagen;
}

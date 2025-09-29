/** @packageDocumentation
 * # Imperativ-Parser: Etagen (`parseImperativEtagenCode`)
 *
 * - Sucht Zeilen im Format `etage_<nr> = <nr>` und ignoriert andere.
 * - Validiert pro Zeile das Muster; bei Abweichung → Fehlermeldung mit Zeilennummer.
 * - Prüft, dass `id` und `nr` gleich sind (z. B. `etage_2 = 2`).
 * - Verhindert Duplikate und erzwingt den Wertebereich **1–3**.
 * - Prüft die Gesamtanzahl: maximal **3** Etagen erlaubt.
 * - Gibt die gefundenen Etagen als `number[]` zurück; bei keiner passenden Zeile → `[]`.
 */

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

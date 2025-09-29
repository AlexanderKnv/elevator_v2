/** @packageDocumentation
 * # Deklarativ-Generator: Etagen (`generateDeklarativEtagenCode`)
 *
 * - Gibt bei leerer Eingabe Leerstring zurück.
 * - Erzeugt einen JSON-ähnlichen Block: `etagen = [ { "nr": <n> }, ... ]`.
 * - Behält die Reihenfolge der übergebenen Etagen **unverändert** bei (keine Sortierung).
 */

export function generateDeklarativEtagenCode(etagen: number[]): string {
    if (etagen.length === 0) return '';

    const list = etagen.map((nr) => `    { "nr": ${nr} }`).join(',\n');
    return `etagen = [\n${list}\n]`;
}
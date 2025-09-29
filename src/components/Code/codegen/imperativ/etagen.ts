/** @packageDocumentation
 * # Imperativ-Generator: Etagen (`generateImperativEtagenCode`)
 *
 * - Erzeugt pro Etage eine Zuweisung im Stil `etage_<n> = <n>`.
 */

export function generateImperativEtagenCode(etagen: number[]): string {
    if (etagen.length === 0) return '';

    return etagen.map((nr) => `etage_${nr} = ${nr}`).join('\n');
}

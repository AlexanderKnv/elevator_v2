/** @packageDocumentation
 * # OOP-Generator: Schacht (`generateOopSchachtCode`)
 *
 * - Definiert die Python-Klasse `SchachtPanel(etage, side)`.
 * - Sortiert Einträge nach `etage` und ordnet `sides` deterministisch: `"left"` vor `"right"`.
 * - Erzeugt pro (Etage, Seite) eine Instanzzeile: `schacht_panel_<etage>_<side> = SchachtPanel(etage_<n>, "<side>")`.
 * - Verwendet `etageVar(n)` zur Ausgabe als `etage_<n>` und liefert Klassendefinition + Instanzen als zusammenhängenden String.
 */

import { etageVar } from "../../../../helpers/renderHelper";
import type { SchachtState } from "../../../../store/schachtSlice";

export function generateOopSchachtCode(state: SchachtState): string {
    const entries = state?.etagenMitSchacht ?? [];
    if (entries.length === 0) return "";

    const classDef = [
        `class SchachtPanel:`,
        `    def __init__(self, etage, side):`,
        `        self.etage = etage`,
        `        self.side = side`,
        ``,
    ].join("\n");

    const instances: string[] = [];

    const sorted = [...entries].sort((a, b) => a.etage - b.etage);
    sorted.forEach((e) => {
        const orderedSides = [...e.sides].sort((a, b) =>
            a === b ? 0 : a === "left" ? -1 : 1
        );
        orderedSides.forEach((side) => {
            instances.push(
                `schacht_panel_${e.etage}_${side} = SchachtPanel(${etageVar(
                    e.etage
                )}, "${side}")`
            );
        });
    });

    return [classDef, instances.join("\n")].join("\n");
}

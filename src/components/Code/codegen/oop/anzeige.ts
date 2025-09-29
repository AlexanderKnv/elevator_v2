/** @packageDocumentation
 * # OOP-Generator: Anzeige (`generateOopAnzeigeCode`)
 *
 * - Erzeugt eine einfache Python-Klasse `AnzeigePanel` mit `__init__(self, etage, side)`.
 * - Sortiert Einträge aufsteigend nach `etage` und ordnet `sides` deterministisch: `"left"` vor `"right"`.
 * - Generiert pro (Etage, Seite) eine Instanzzeile: `anzeige_panel_<etage>_<side> = AnzeigePanel(etage_<n>, "<side>")`.
 * - Verwendet `etageVar(n)` zur Ausgabe als `etage_<n>`.
 * - Liefert einen zusammenhängenden String aus Klassendefinition und Instanzzuweisungen.
 */

import { etageVar } from "../../../../helpers/renderHelper";
import type { AnzeigeState } from "../../../../store/anzeigeSlice ";

export function generateOopAnzeigeCode(state: AnzeigeState): string {
    const entries = state?.etagenMitAnzeige ?? [];
    if (entries.length === 0) return "";

    const classDef = [
        `class AnzeigePanel:`,
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
                `anzeige_panel_${e.etage}_${side} = AnzeigePanel(${etageVar(
                    e.etage
                )}, "${side}")`
            );
        });
    });

    return [classDef, instances.join("\n")].join("\n");
}

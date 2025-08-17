import { etageVar } from "../../../../helpers/renderHelper";

export function generateOopAnzeigeCode(etagenMitAnzeige: number[]): string {
    if (!etagenMitAnzeige || etagenMitAnzeige.length === 0) return "";

    const uniqSorted = Array.from(new Set(etagenMitAnzeige)).sort((a, b) => a - b);

    const classDef = [
        `class AnzeigePanel:`,
        `    def __init__(self, etage):`,
        `        self.etage = etage`,
        ``,
    ].join("\n");

    const instances = uniqSorted
        .map((n) => `anzeige_panel_${n} = AnzeigePanel(${etageVar(n)})`)
        .join("\n");

    return [classDef, instances].join("\n").trimEnd();
}

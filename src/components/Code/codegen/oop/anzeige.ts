import { etageVar } from "../../../../helpers/renderHelper";

export function generateOopAnzeigeCode(etagenMitAnzeige: number[]): string {
    const uniqSorted = Array.from(new Set(etagenMitAnzeige ?? [])).sort((a, b) => a - b);

    const instances =
        uniqSorted.length > 0
            ? uniqSorted.map((n) => `anzeige_panel_${n} = AnzeigePanel(${etageVar(n)})`).join("\n") + "\n"
            : "";

    return [oopClassDef(), instances].join("\n").trimEnd();
}

function oopClassDef(): string {
    return [
        `class AnzeigePanel:`,
        `    def __init__(self, etage):`,
        `        self.etage = etage`,
    ].join("\n");
}

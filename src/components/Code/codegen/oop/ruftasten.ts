import type { Richtung } from "../../../../store/ruftasteSlice";
import { etageVar } from "../../../../helpers/renderHelper";

export function generateOopRuftasteCode(
    etagenMitRuftasten: number[],
    aktiveRuftasten: { etage: number; callDirection: Richtung }[]
): string {
    const etagen = Array.from(new Set(etagenMitRuftasten ?? [])).sort((a, b) => a - b);
    const active = [...(aktiveRuftasten ?? [])]
        .map(x => ({ etage: x.etage, callDirection: x.callDirection }))
        .sort(
            (a, b) =>
                a.etage - b.etage ||
                (a.callDirection === "up" && b.callDirection === "down" ? -1 :
                    a.callDirection === b.callDirection ? 0 : 1)
        );

    const panelLines = etagen.map(n => `panel_${n} = RuftastenPanel(${etageVar(n)})`).join("\n");
    const aktiveLines = active
        .map(e => `    AktiverRuf(panel_${e.etage}, "${e.callDirection}")`)
        .join(",\n");

    const parts = [
        oopPanelClassDef(),
        panelLines ? "\n" + panelLines + "\n" : "\n",
        oopActiveClassDef(),
        `aktive_ruftasten = [\n${aktiveLines}\n]`,
    ];

    return parts.join("\n").trimEnd();
}

function oopPanelClassDef(): string {
    return [
        `class RuftastenPanel:`,
        `    def __init__(self, etage):`,
        `        self.etage = etage`,
    ].join("\n");
}

function oopActiveClassDef(): string {
    return [
        `class AktiverRuf:`,
        `    def __init__(self, panel, direction):`,
        `        self.panel = panel`,
        `        self.direction = direction`,
    ].join("\n");
}

import type { Richtung } from "../../../../store/ruftasteSlice";
import { etageVar } from "../../../../helpers/renderHelper";

export function generateOopRuftasteCode(
    etagenMitRuftasten: number[] = [],
    aktiveRuftasten: { etage: number; callDirection: Richtung }[] = []
): string {
    const hasPanels = (etagenMitRuftasten?.length ?? 0) > 0;
    const hasCalls = (aktiveRuftasten?.length ?? 0) > 0;

    if (!hasPanels && !hasCalls) return "";

    const parts: string[] = [];

    if (hasPanels) {
        const classPanel = [
            `class RuftastenPanel:`,
            `    def __init__(self, etage):`,
            `        self.etage = etage`,
            ``,
        ].join("\n");

        const panels = [...new Set(etagenMitRuftasten)]
            .sort((a, b) => a - b)
            .map((nr) => `panel_${nr} = RuftastenPanel(${etageVar(nr)})`)
            .join("\n");

        parts.push(classPanel + panels);
    }

    if (hasCalls) {
        const classCall = [
            ``,
            `class AktiverRuf:`,
            `    def __init__(self, panel, direction):`,
            `        self.panel = panel`,
            `        self.direction = direction`,
            ``,
        ].join("\n");

        const calls = aktiveRuftasten
            .map(
                (r, idx) =>
                    `aktiver_ruf_${idx + 1} = AktiverRuf(panel_${r.etage}, "${r.callDirection}")`
            )
            .join("\n");

        parts.push(classCall + calls);
    }

    return parts.join("\n").trimEnd();
}

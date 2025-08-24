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

import type { Richtung } from "../../../../store/ruftasteSlice";
import { etageVar, etageVarArray } from "../../../../helpers/renderHelper";

export function generateImperativRuftasteCode(
    etagenMitRuftasten: number[],
    aktiveRuftasten: { etage: number; callDirection: Richtung }[]
): string {
    const parts: string[] = [];

    const etagen = Array.from(new Set(etagenMitRuftasten ?? [])).sort((a, b) => a - b);
    const active = [...(aktiveRuftasten ?? [])]
        .map(a => ({ etage: a.etage, callDirection: a.callDirection }))
        .sort(
            (a, b) =>
                a.etage - b.etage ||
                (a.callDirection === "up" && b.callDirection === "down" ? -1 :
                    a.callDirection === b.callDirection ? 0 : 1)
        );

    if (etagen.length > 0) {
        parts.push(`ruftasten_etagen = ${etageVarArray(etagen)}`);
    }

    if (active.length > 0) {
        const lines = active
            .map(e => `  { "etage": ${etageVar(e.etage)}, "call_direction": "${e.callDirection}" }`)
            .join(",\n");
        parts.push(`aktive_ruftasten = [\n${lines}\n]`);
    }

    return parts.join("\n\n");
}

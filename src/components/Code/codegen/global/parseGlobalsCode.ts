import { stripHashComments } from "../../../../helpers/parsingHelper";
import type { GlobalsState } from "../../../../store/globalsSlice";


export function parseGlobalsCode(code: string): GlobalsState | null {
    const text = stripHashComments(code);
    const lines = text.split("\n").map(l => l.trim());

    let speed: number | null = null;
    let door: number | null = null;

    for (const l of lines) {
        const m1 = l.match(/^SPEED\s*=\s*(\d+)\b/);
        if (m1) speed = parseInt(m1[1], 10);
        const m2 = l.match(/^DOOR_TIME\s*=\s*(\d+)\b/);
        if (m2) door = parseInt(m2[1], 10);
    }

    if (speed == null && door == null) return null;

    const check = (v: number, name: string) => {
        if (v < 100 || v > 60000) throw new Error(`${name} außerhalb des Bereichs (100..60000 ms).`);
    };
    if (speed != null) check(speed, "SPEED");
    if (door != null) check(door, "DOOR_TIME");

    return {
        speedMs: speed ?? undefined as unknown as number,
        doorTimeMs: door ?? undefined as unknown as number,
    } as Partial<GlobalsState> as GlobalsState;
}

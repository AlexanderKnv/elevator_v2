import type { Kabine } from "../store/kabineSlice";

export const getKabineIdNumber = (id: string) => parseInt(id.split("-")[1] ?? "0", 10) || 0;

export function sortKabinenById(kabinen: Kabine[]) {
    return [...kabinen].sort((a, b) => getKabineIdNumber(a.id) - getKabineIdNumber(b.id));
}

export const doorsStateFromOpen = (open: boolean): "open" | "closed" => (open ? "open" : "closed");

export const deriveDirection = (current: number, target: number | null): "up" | "down" | null => {
    if (target == null) return null;
    if (target > current) return "up";
    if (target < current) return "down";
    return null;
};

// Удобный конвертер, если парсер собирает «сырой» объект полей (без doorsState)
export function toKabineState(parsed: {
    idNum: number;
    currentEtage: number;
    targetEtage: number | null;
    isMoving: boolean;
    doorsOpen: boolean;
    callQueue: number[];
    directionMovement: "up" | "down" | null;
    hasBedienpanel: boolean;
    aktiveZielEtagen: number[];
}): Kabine {
    return {
        id: `kabine-${parsed.idNum}`,
        currentEtage: parsed.currentEtage,
        targetEtage: parsed.targetEtage,
        isMoving: parsed.isMoving,
        doorsOpen: parsed.doorsOpen,
        callQueue: parsed.callQueue,
        directionMovement: parsed.directionMovement,
        hasBedienpanel: parsed.hasBedienpanel,
        aktiveZielEtagen: parsed.aktiveZielEtagen,
        doorsState: doorsStateFromOpen(parsed.doorsOpen),
    };
}

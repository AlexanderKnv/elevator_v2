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

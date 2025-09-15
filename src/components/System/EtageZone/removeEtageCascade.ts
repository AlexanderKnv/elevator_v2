import { resetAnzeige } from "../../../store/anzeigeSlice ";
import { resetEtagen } from "../../../store/etageSlice";
import { resetKabinen, type Kabine } from "../../../store/kabineSlice";
import { resetRuftasten } from "../../../store/ruftasteSlice";
import { resetSchacht } from "../../../store/schachtSlice";
import type { AppDispatch, RootState } from "../../../store/store";

const remapEtage = (n: number, removed: number): number | null =>
    n === removed ? null : n > removed ? n - 1 : n;

const remapEtageOrClamp = (n: number, removed: number, newMax: number): number => {
    if (n === removed) return Math.min(removed, newMax);
    if (n > removed) return n - 1;
    return n;
};

const remapArrayNumbers = (arr: number[], removed: number) =>
    arr
        .map((n) => remapEtage(n, removed))
        .filter((n): n is number => n != null);

export const removeEtageCascade =
    (removedEtage: number) =>
        (dispatch: AppDispatch, getState: () => any) => {
            const state: RootState = getState();

            const newEtagen = remapArrayNumbers(state.etage.etagen, removedEtage).sort((a, b) => a - b);
            const newMax = newEtagen.length;

            const newAnzeige = {
                etagenMitAnzeige: state.anzeige.etagenMitAnzeige
                    .map((e) => {
                        const mapped = remapEtage(e.etage, removedEtage);
                        if (mapped == null) return null;
                        const sides = Array.from(new Set(e.sides)).slice(0, 2);
                        return { etage: mapped, sides };
                    })
                    .filter(Boolean) as { etage: number; sides: ('left' | 'right')[] }[],
            };

            const newSchacht = {
                etagenMitSchacht: state.schacht.etagenMitSchacht
                    .map((e) => {
                        const mapped = remapEtage(e.etage, removedEtage);
                        if (mapped == null) return null;
                        const sides = Array.from(new Set(e.sides)).slice(0, 2);
                        return { etage: mapped, sides };
                    })
                    .filter(Boolean) as { etage: number; sides: ('left' | 'right')[] }[],
            };

            const newRuftasten = {
                etagenMitRuftasten: remapArrayNumbers(state.ruftaste.etagenMitRuftasten, removedEtage).sort(
                    (a, b) => a - b
                ),
                aktiveRuftasten: state.ruftaste.aktiveRuftasten
                    .map((r) => {
                        const mapped = remapEtage(r.etage, removedEtage);
                        return mapped == null ? null : { etage: mapped, callDirection: r.callDirection };
                    })
                    .filter(Boolean) as { etage: number; callDirection: 'up' | 'down' }[],
            };

            const newKabinen: Kabine[] = state.kabine.kabinen.map((k) => {
                const currentEtage = remapEtageOrClamp(k.currentEtage, removedEtage, newMax);

                let targetEtage =
                    k.targetEtage == null ? null : remapEtage(k.targetEtage, removedEtage);
                let isMoving = k.isMoving;
                let directionMovement = k.directionMovement;

                if (k.targetEtage != null && targetEtage == null) {
                    isMoving = false;
                    directionMovement = null;
                }

                const callQueue = remapArrayNumbers(k.callQueue, removedEtage);
                const aktiveZielEtagen = remapArrayNumbers(k.aktiveZielEtagen, removedEtage);
                const safeCurrent = Math.min(Math.max(currentEtage, 1), Math.max(newMax, 1));

                return {
                    ...k,
                    currentEtage: safeCurrent,
                    targetEtage,
                    isMoving,
                    directionMovement,
                    callQueue,
                    aktiveZielEtagen,
                    // опционально: закрыть двери, если target сброшен
                    // doorsOpen: targetEtage == null ? false : k.doorsOpen,
                };
            });

            dispatch(resetEtagen(newEtagen));
            dispatch(resetAnzeige(newAnzeige));
            dispatch(resetSchacht(newSchacht));
            dispatch(resetRuftasten(newRuftasten));
            dispatch(resetKabinen(newKabinen));
        };

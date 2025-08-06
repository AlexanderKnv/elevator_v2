import { completeMovement, openDoors, removeCallFromQueue, removeZielEtage, setDoorsState, setRichtung, setTargetEtage } from "../../../store/kabineSlice";
import { deactivateRuftaste } from "../../../store/ruftasteSlice";
import type { AppDispatch } from "../../../store/store";

export const processNextCall = () => (dispatch: AppDispatch, getState: () => any) => {
    const state = getState();
    const kabine = state.kabine.kabinen[0];

    if (!kabine || kabine.isMoving || !kabine.callQueue || kabine.callQueue.length === 0) return;
    const currentEtage = kabine.currentEtage;
    const queue = kabine.callQueue;

    if (queue.includes(currentEtage)) {
        dispatch(openDoors());
        dispatch(setDoorsState('opening'));

        setTimeout(() => {
            dispatch(openDoors());
            dispatch(setDoorsState('closing'));
        }, 8000);

        setTimeout(() => {
            dispatch(setDoorsState('closed'));
            dispatch(removeCallFromQueue(currentEtage));
        }, 13000);

        return;
    }

    let richtung = kabine.richtung;

    if (!richtung) {
        const nextEtage = queue[0];
        richtung = nextEtage > currentEtage ? 'up' : 'down';
        dispatch(setRichtung(richtung));
    }

    const filteredQueue = queue
        .filter((etage: number) =>
            richtung === 'up' ? etage > currentEtage : etage < currentEtage
        )
        .sort((a: number, b: number) => (richtung === 'up' ? a - b : b - a));

    if (filteredQueue.length === 0) {
        dispatch(setRichtung(richtung === 'up' ? 'down' : 'up'));
        dispatch(processNextCall());
        return;
    }

    const nextEtage = filteredQueue[0];

    dispatch(setTargetEtage(nextEtage));

    const travelDuration = Math.abs(currentEtage - nextEtage) * 5000;

    setTimeout(() => {
        dispatch(completeMovement());
        dispatch(deactivateRuftaste({ etage: nextEtage, richtung: 'up' }));
        dispatch(deactivateRuftaste({ etage: nextEtage, richtung: 'down' }));
        dispatch(removeZielEtage(nextEtage));

        dispatch(openDoors());
        dispatch(setDoorsState('opening'));

        setTimeout(() => {
            dispatch(openDoors());
            dispatch(setDoorsState('closing'));
        }, 8000);

        setTimeout(() => {
            dispatch(setDoorsState('closed'));
            dispatch(removeCallFromQueue(nextEtage));
            dispatch(processNextCall());
        }, 13000);
    }, travelDuration);
};
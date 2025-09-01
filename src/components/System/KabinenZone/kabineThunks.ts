import type { AppDispatch } from '../../../store/store';
import { addCallToQueue, type Kabine, type KabineSide } from '../../../store/kabineSlice';
import { processNextCall } from './processNextCall';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabinen = getState().kabine.kabinen;

    if (!kabinen || kabinen.length === 0) return;

    if (kabinen.length === 1) {
        const kabine = kabinen[0];
        const { doorsState, isMoving, doorsOpen, side } = kabine;

        dispatch(addCallToQueue({ side, etage }));

        if (isMoving || doorsOpen || doorsState === 'opening' || doorsState === 'closing') return;

        dispatch(processNextCall(side));
        return;
    }

    if (kabinen.length === 2) {
        const left = kabinen.find((k: Kabine) => k.side === 'left');
        const right = kabinen.find((k: Kabine) => k.side === 'right');
        const alreadyQueuedAcross = left.callQueue.includes(etage) || right.callQueue.includes(etage);
        if (!left || !right) return;

        const isFree = (k: Kabine) =>
            !k.isMoving && !k.doorsOpen && k.doorsState !== 'opening' && k.doorsState !== 'closing';

        if (isFree(left) && isFree(right) && left.currentEtage === etage && right.currentEtage === etage) {
            if (!alreadyQueuedAcross) {
                dispatch(addCallToQueue({ side: 'left', etage }));
            }
            dispatch(processNextCall('left'));
            return;
        }

        if (isFree(left) && isFree(right) && left.currentEtage === right.currentEtage && left.currentEtage !== etage) {
            if (!alreadyQueuedAcross) {
                dispatch(addCallToQueue({ side: 'left', etage }));
            }
            dispatch(processNextCall('left'));
            return;
        }

        if (isFree(left) && isFree(right) && left.currentEtage !== right.currentEtage) {
            const dL = Math.abs(left.currentEtage - etage);
            const dR = Math.abs(right.currentEtage - etage);
            const chosen: KabineSide = dL <= dR ? 'left' : 'right';
            if (!alreadyQueuedAcross) {
                dispatch(addCallToQueue({ side: chosen, etage }));
            }
            dispatch(processNextCall(chosen));
            return;
        }

        if (isFree(left) && !isFree(right)) {
            if (!alreadyQueuedAcross) {
                dispatch(addCallToQueue({ side: 'left', etage }));
            }
            dispatch(processNextCall('left'));
            return;
        }
        if (isFree(right) && !isFree(left)) {
            if (!alreadyQueuedAcross) {
                dispatch(addCallToQueue({ side: 'right', etage }));
            }
            dispatch(processNextCall('right'));
            return;
        }
        if (!isFree(left) && !isFree(right)) {
            return;
        }

        return;
    }
};
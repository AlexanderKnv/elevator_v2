import type { AppDispatch } from '../../../store/store';
import { addCallToQueue } from '../../../store/kabineSlice';
import { processNextCall } from './processNextCall';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabine = getState().kabine.kabinen[0];
    if (!kabine) return;

    const { doorsState, isMoving, doorsOpen } = kabine;

    dispatch(addCallToQueue(etage));

    if (isMoving || doorsOpen || doorsState === 'opening' || doorsState === 'closing') return;

    dispatch(processNextCall());
};
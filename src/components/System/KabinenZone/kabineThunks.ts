import type { AppDispatch } from '../../../store/store';
import { addCallToQueue } from '../../../store/kabineSlice';
import { processNextCall } from './processNextCall';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabine = getState().kabine.kabinen[0];

    if (!kabine) return;

    dispatch(addCallToQueue(etage));

    if (kabine.isMoving || kabine.doorsOpen) return;

    dispatch(processNextCall());
};

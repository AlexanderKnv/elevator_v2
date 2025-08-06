import type { AppDispatch } from '../../../store/store';
import { addCallToQueue } from '../../../store/kabineSlice';
import { processNextCall } from './processNextCall';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabine = getState().kabine.kabinen[0];
    const doorsState = kabine.doorsState;

    if (!kabine) return;

    dispatch(addCallToQueue(etage));

    if (kabine.isMoving || kabine.doorsOpen || doorsState === 'opening' || doorsState === 'closing') return;

    dispatch(processNextCall());
};

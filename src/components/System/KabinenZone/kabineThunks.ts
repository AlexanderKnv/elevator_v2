import type { AppDispatch } from '../../../store/store';
import { addCallToQueue } from '../../../store/kabineSlice';
import { processNextCall } from './processNextCall';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabine = getState().kabine.kabinen[0];
    if (!kabine) return;

    const { doorsState, isMoving, doorsOpen } = kabine;

    // Уже в очереди — ничего не делаем


    dispatch(addCallToQueue(etage));

    // Если кабина занята — ждём
    if (isMoving || doorsOpen || doorsState === 'opening' || doorsState === 'closing') return;


    dispatch(processNextCall());
};

// console.log(kabine.isMoving)
// console.log(kabine.doorsOpen)
// console.log(doorsState === 'opening')
// console.log(doorsState === 'closing')
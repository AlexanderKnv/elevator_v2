import type { AppDispatch } from '../../../store/store';
import { addCallToQueue } from '../../../store/kabineSlice';
import { processNextCall } from './processNextCall';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabine = getState().kabine.kabinen[0];

    if (!kabine) return;

    // Добавляем вызов в очередь
    dispatch(addCallToQueue(etage));
    // console.log(kabine)
    // Если кабина уже едет или открывает двери — ничего не делаем
    if (kabine.isMoving || kabine.doorsOpen) return;

    dispatch(processNextCall());
};

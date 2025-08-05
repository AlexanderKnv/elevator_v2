import type { AppDispatch } from '../../../store/store';
import { setTargetEtage, completeMovement, openDoors } from '../../../store/kabineSlice';
import { deactivateRuftaste } from '../../../store/ruftasteSlice';

export const moveKabineToEtage = (etage: number) => (dispatch: AppDispatch, getState: () => any) => {
    const kabine = getState().kabine.kabinen[0];

    const travelDuration = Math.abs(kabine.currentEtage - etage) * 5000;

    if (!kabine || kabine.isMoving) return;

    if (kabine.currentEtage === etage) {
        dispatch(openDoors());
        setTimeout(() => {
            dispatch(openDoors());
        }, 8000);
        return;
    }

    dispatch(setTargetEtage(etage));

    setTimeout(() => {
        dispatch(completeMovement());
        dispatch(deactivateRuftaste({ etage, richtung: 'up' }));
        dispatch(deactivateRuftaste({ etage, richtung: 'down' }));
        setTimeout(() => dispatch(openDoors()), 1000);
        setTimeout(() => dispatch(openDoors()), 9000);
    }, travelDuration);
};

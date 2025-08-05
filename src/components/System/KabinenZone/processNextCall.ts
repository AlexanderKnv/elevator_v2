import { completeMovement, openDoors, removeCallFromQueue, setTargetEtage } from "../../../store/kabineSlice";
import { deactivateRuftaste } from "../../../store/ruftasteSlice";
import type { AppDispatch } from "../../../store/store";

export const processNextCall = () => (dispatch: AppDispatch, getState: () => any) => {
    const state = getState();
    const kabine = state.kabine.kabinen[0];

    if (!kabine || kabine.isMoving || !kabine.callQueue || kabine.callQueue.length === 0) return;

    const nextEtage = kabine.callQueue[0];


    // Если уже на нужном этаже — просто открываем двери
    if (kabine.currentEtage === nextEtage) {
        dispatch(openDoors());
        setTimeout(() => {
            dispatch(openDoors());
        }, 8000);

        dispatch(removeCallFromQueue(nextEtage));
        return;
    }

    // Двигаемся к нужному этажу
    dispatch(setTargetEtage(nextEtage));

    const travelDuration = Math.abs(kabine.currentEtage - nextEtage) * 5000;

    setTimeout(() => {
        dispatch(completeMovement());
        dispatch(deactivateRuftaste({ etage: nextEtage, richtung: 'up' }));
        dispatch(deactivateRuftaste({ etage: nextEtage, richtung: 'down' }));

        setTimeout(() => dispatch(openDoors()), 1000);
        setTimeout(() => dispatch(openDoors()), 9000);

        dispatch(removeCallFromQueue(nextEtage));

        // Запускаем обработку следующего вызова
        setTimeout(() => {
            dispatch(processNextCall());
        }, 15000); // Подождав пока двери закроются
    }, travelDuration);
};



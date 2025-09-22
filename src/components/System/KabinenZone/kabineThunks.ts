/** @packageDocumentation
 * # Kabinenaufruf-Thunk (`moveKabineToEtage`)
 *
 * Steuert den Aufzugsaufruf zu einer Ziel-Etage und verteilt ihn ggf. auf die passende Kabine.
 *
 * - Fügt bei Bedarf einen Etagenruf zur Queue der passenden Kabine hinzu (`addCallToQueue`).
 * - Startet die Abarbeitung der Queue (`processNextCall`), wenn eine Kabine frei ist.
 * - Unterstützt Ein- **und** Zwei-Kabinen-Szenarien (Seiten: `'left'` / `'right'`).
 *
 * **Logik im Überblick**
 * - **0 Kabinen** → beendet ohne Aktion.
 * - **1 Kabine** → Ruf enqueuen.
 * - **2 Kabinen**:
 *   - Beide frei **und** beide **auf Ziel-Etage** → enqueuen (links, falls neu) → `processNextCall('left')`.
 *   - Beide frei, **gleiche Etage ≠ Ziel** → enqueuen (links) → `processNextCall('left')`.
 *   - Beide frei, **unterschiedliche Etagen** → wähle die **nähere** Kabine per Distanzvergleich (`dL`/`dR`).
 *   - Nur **links** frei → links; nur **rechts** frei → rechts.
 *   - Beide **belegt** → keine Aktion.
 * - Schutz vor Doppel-Queue über beide Kabinen mittels `alreadyQueuedAcross`.
 */


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
import { completeMovement, openDoors, removeCallFromQueue, removeZielEtage, setDoorsState, setDirectionMovement, setTargetEtage } from "../../../store/kabineSlice";
import { deactivateRuftaste } from "../../../store/ruftasteSlice";
import type { AppDispatch } from "../../../store/store";

type Direction = 'up' | 'down' | null;

export const processNextCall = () => (dispatch: AppDispatch, getState: () => any) => {
    const state = getState();
    const kabine = state.kabine.kabinen[0];
    const uniq = (arr: number[]) => Array.from(new Set(arr));
    if (!kabine || kabine.isMoving) return;

    const currentEtage = kabine.currentEtage;

    // Внутренние цели — ИЗ aktiveZielEtagen
    const zielEtagen: number[] = state.kabine.kabinen[0]?.aktiveZielEtagen ?? [];
    const internalSet = new Set(zielEtagen);

    // Холл-вызовы
    const aktiveRuftasten = (state.ruftaste.aktiveRuftasten ?? []) as { etage: number; callDirection: 'up' | 'down' }[];
    const hallUp = new Set(aktiveRuftasten.filter(r => r.callDirection === 'up').map(r => r.etage));
    const hallDown = new Set(aktiveRuftasten.filter(r => r.callDirection === 'down').map(r => r.etage));

    // Если совсем пусто — ничего не делаем
    if (zielEtagen.length === 0 && aktiveRuftasten.length === 0) return;

    const isAhead = (from: number, to: number, dir: Exclude<Direction, null>) => (dir === 'up' ? to > from : to < from);

    const demandFloorsAll = uniq([...zielEtagen, ...aktiveRuftasten.map(r => r.etage)]);

    const nearestOf = (floors: number[]) => {
        let best: number | null = null;
        let bestDist = Infinity;
        for (const f of floors) {
            const d = Math.abs(f - currentEtage);
            if (d === 0) continue;
            if (d < bestDist) { best = f; bestDist = d; }
        }
        return best;
    };

    const nearestDemandDirection = (): Direction => {
        const f = nearestOf(demandFloorsAll);
        if (f == null) return null;
        return f > currentEtage ? 'up' : 'down';
    };

    const buildCandidates = (floors: number[], from: number, dir: Exclude<Direction, null>) => {
        const isUp = dir === 'up';
        return floors.filter(e => (isUp ? e > from : e < from)).sort((a, b) => (isUp ? a - b : b - a));
    };

    let directionMovement: Direction = kabine.directionMovement ?? null;

    // Если направления нет — выбери по текущему холлу либо ближайшему требованию
    if (!directionMovement) {
        if (hallUp.has(currentEtage)) directionMovement = 'up';
        else if (hallDown.has(currentEtage)) directionMovement = 'down';
        else directionMovement = nearestDemandDirection();
        dispatch(setDirectionMovement(directionMovement));
    }

    // Нужно ли остановиться прямо здесь?
    const shouldStopHere = (dir: Direction) => {
        if (internalSet.has(currentEtage)) return true;
        if (!dir) return hallUp.has(currentEtage) || hallDown.has(currentEtage); // без направления — обслуживаем любой холл на текущем
        return dir === 'up' ? hallUp.has(currentEtage) : hallDown.has(currentEtage);
    };

    if (shouldStopHere(directionMovement)) {
        dispatch(openDoors());
        dispatch(setDoorsState('opening'));
        setTimeout(() => { dispatch(openDoors()); dispatch(setDoorsState('closing')); }, 5000);
        setTimeout(() => {
            dispatch(setDoorsState('closed'));
            dispatch(deactivateRuftaste({ etage: currentEtage, callDirection: 'up' }));
            dispatch(deactivateRuftaste({ etage: currentEtage, callDirection: 'down' }));
            dispatch(removeZielEtage(currentEtage));
            dispatch(removeCallFromQueue(currentEtage));
            const s = getState();
            const hasZiel = (s.kabine.kabinen[0]?.aktiveZielEtagen ?? []).length > 0;
            const hasHall = (s.ruftaste.aktiveRuftasten ?? []).length > 0;
            if (hasZiel || hasHall) dispatch(processNextCall()); else dispatch(setDirectionMovement(null));
        }, 10000);
        return;
    }

    // Кандидаты ВПЕРЁД по направлению: внутр. цели + холлы по направлению
    const forwardHalls = directionMovement === 'up' ? Array.from(hallUp) : Array.from(hallDown);
    let candidates: number[] = directionMovement
        ? buildCandidates(uniq([...zielEtagen, ...forwardHalls]), currentEtage, directionMovement as Exclude<Direction, null>)
        : [];

    // Если вперёд пусто — разворачиваемся
    if (candidates.length === 0 && directionMovement) {
        const opposite = directionMovement === 'up' ? 'down' : 'up';
        const oppositeHalls = opposite === 'up' ? Array.from(hallUp) : Array.from(hallDown);
        const oppCandidates = buildCandidates(
            uniq([...zielEtagen, ...oppositeHalls]).filter(e => isAhead(currentEtage, e, opposite)),
            currentEtage,
            opposite
        );
        if (oppCandidates.length > 0) {
            directionMovement = opposite;
            dispatch(setDirectionMovement(opposite));
            candidates = oppCandidates;
        }
    }

    // 🔒 ФОЛБЭК: если всё ещё пусто — едем к ближайшему требованию (вне зависимости от направления)
    if (candidates.length === 0) {
        const nearest = nearestOf(demandFloorsAll);
        if (nearest == null || nearest === currentEtage) { dispatch(setDirectionMovement(null)); return; }
        candidates = [nearest];
        directionMovement = nearest > currentEtage ? 'up' : 'down';
        dispatch(setDirectionMovement(directionMovement));
    }

    // Едем к следующему кандидату
    const nextEtage = candidates[0];
    const travelDuration = Math.abs(currentEtage - nextEtage) * 5000;

    dispatch(setTargetEtage(nextEtage));

    setTimeout(() => {
        dispatch(completeMovement());

        // Снимаем требования на этаже прибытия
        dispatch(deactivateRuftaste({ etage: nextEtage, callDirection: 'up' }));
        dispatch(deactivateRuftaste({ etage: nextEtage, callDirection: 'down' }));
        dispatch(removeZielEtage(nextEtage));
        dispatch(removeCallFromQueue(nextEtage));

        // Двери
        dispatch(openDoors());
        dispatch(setDoorsState('opening'));
        setTimeout(() => { dispatch(openDoors()); dispatch(setDoorsState('closing')); }, 5000);
        setTimeout(() => {
            dispatch(setDoorsState('closed'));
            const s = getState();
            const hasZiel = (s.kabine.kabinen[0]?.aktiveZielEtagen ?? []).length > 0;
            const hasHall = (s.ruftaste.aktiveRuftasten ?? []).length > 0;
            if (hasZiel || hasHall) dispatch(processNextCall()); else dispatch(setDirectionMovement(null));
        }, 10000);
    }, travelDuration);
};
import { completeMovement, openDoors, removeCallFromQueue, removeZielEtage, setDoorsState, setDirectionMovement, setTargetEtage, setCurrentEtage, type KabineSide, type Kabine } from "../../../store/kabineSlice";
import { deactivateRuftaste } from "../../../store/ruftasteSlice";
import type { AppDispatch } from "../../../store/store";

type Direction = 'up' | 'down' | null;

// --- Hall-call claims (module-scope «claim-on-ready») ---
type HallDir = 'up' | 'down';
type HallKey = `${number}|${HallDir}`;
const hallClaims = new Map<HallKey, KabineSide>();
const hallKey = (etage: number, dir: HallDir) => `${etage}|${dir}` as HallKey;

const canClaim = (side: KabineSide, etage: number, dirs: HallDir[]) => {
    for (const d of dirs) {
        const cur = hallClaims.get(hallKey(etage, d));
        if (cur && cur !== side) return false;
    }
    return true;
};
const claim = (side: KabineSide, etage: number, dirs: HallDir[]) => {
    for (const d of dirs) hallClaims.set(hallKey(etage, d), side);
};
const release = (etage: number, dirs: HallDir[] = ['up', 'down']) => {
    for (const d of dirs) hallClaims.delete(hallKey(etage, d));
};

const allTimeouts = new Set<ReturnType<typeof setTimeout>>();

export function setT(fn: () => void, ms: number) {
    const id = setTimeout(() => {
        allTimeouts.delete(id);
        fn();
    }, ms) as ReturnType<typeof setTimeout>;

    allTimeouts.add(id);
    return id;
}

export function clearAllTimeouts() {
    for (const id of allTimeouts) clearTimeout(id);
    allTimeouts.clear();
}

export const processNextCall = (side: KabineSide) => (dispatch: AppDispatch, getState: () => any) => {
    const state = getState();
    const kabine = state.kabine.kabinen.find((k: Kabine) => k.side === side);
    const uniq = (arr: number[]) => Array.from(new Set(arr));
    if (!kabine || kabine.isMoving) return;

    const currentEtage = kabine.currentEtage;

    // Interne Ziele aus aktiveZielEtagen ableiten
    const zielEtagen: number[] = state.kabine.kabinen.find((k: Kabine) => k.side === side)?.aktiveZielEtagen ?? [];
    const internalSet = new Set(zielEtagen);

    // Hallrufe (Claims + Busy-Status der anderen Kabine berücksichtigen)
    const allHall = (state.ruftaste.aktiveRuftasten ?? []) as { etage: number; callDirection: 'up' | 'down' }[];

    const aktiveRuftasten = allHall.filter(r => {
        const claimed = hallClaims.get(hallKey(r.etage, r.callDirection));
        return !claimed || claimed === side;
    });

    const hallUp = new Set(aktiveRuftasten.filter(r => r.callDirection === 'up').map(r => r.etage));
    const hallDown = new Set(aktiveRuftasten.filter(r => r.callDirection === 'down').map(r => r.etage));

    // Bei Leerzustand: keine Aktion
    if (zielEtagen.length === 0 && aktiveRuftasten.length === 0) {
        if (kabine.directionMovement) {
            dispatch(setDirectionMovement({ side, direction: null }));
        }
        return;
    }

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

    // Kein Richtungsflag → Entscheidung nach Ruf auf der Rufetage oder nach der nächsten Anforderung
    if (!directionMovement) {
        if (hallUp.has(currentEtage)) directionMovement = 'up';
        else if (hallDown.has(currentEtage)) directionMovement = 'down';
        else directionMovement = nearestDemandDirection();
        dispatch(setDirectionMovement({ side, direction: directionMovement }));
    }

    // Soll hier gehalten werden?
    const shouldStopHere = (dir: Direction) => {
        if (internalSet.has(currentEtage)) return true;

        const other = state.kabine.kabinen.find((k: Kabine) => k.side !== side);
        if (other && other.currentEtage === currentEtage && other.doorsState !== 'closed') return false;

        const hallHereDirs = (allHall
            .filter(r => r.etage === currentEtage)
            .map(r => r.callDirection as 'up' | 'down'));

        const claimable = hallHereDirs.filter(d => {
            const cl = hallClaims.get(hallKey(currentEtage, d));
            return !cl || cl === side;
        });

        if (claimable.length > 0) {
            claim(side, currentEtage, claimable);
            if (dir) dispatch(setDirectionMovement({ side, direction: null }));
            return true;
        }

        if (!dir) return hallUp.has(currentEtage) || hallDown.has(currentEtage);
        return dir === 'up' ? hallUp.has(currentEtage) : hallDown.has(currentEtage);
    };

    if (shouldStopHere(directionMovement)) {
        dispatch(openDoors({ side }));
        dispatch(setDoorsState({ side, state: 'opening' }));
        setT(() => { dispatch(openDoors({ side })); dispatch(setDoorsState({ side, state: 'closing' })); }, 5000);
        setT(() => {
            dispatch(setDoorsState({ side, state: 'closed' }));
            dispatch(deactivateRuftaste({ etage: currentEtage, callDirection: 'up' }));
            dispatch(deactivateRuftaste({ etage: currentEtage, callDirection: 'down' }));
            release(currentEtage);
            dispatch(removeZielEtage({ side, etage: currentEtage }));
            dispatch(removeCallFromQueue({ side, etage: currentEtage }));
            const s = getState();
            const hasZiel = (s.kabine.kabinen.find((k: Kabine) => k.side === side)?.aktiveZielEtagen ?? []).length > 0;
            const hasHall = (s.ruftaste.aktiveRuftasten ?? []).length > 0;
            if (hasZiel || hasHall) dispatch(processNextCall(side)); else dispatch(setDirectionMovement({ side, direction: null }));
        }, 10000);
        return;
    }

    // In Richtung voraus: Innenziele & Außenrufe in derselben Richtung
    const forwardHalls = directionMovement === 'up' ? Array.from(hallUp) : Array.from(hallDown);
    let candidates: number[] = directionMovement
        ? buildCandidates(uniq([...zielEtagen, ...forwardHalls]), currentEtage, directionMovement as Exclude<Direction, null>)
        : [];

    // Keine Ziele voraus → umkehren
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
            dispatch(setDirectionMovement({ side, direction: opposite }));
            candidates = oppCandidates;
        }
    }

    // Фолбэк
    if (candidates.length === 0) {
        const nearest = nearestOf(demandFloorsAll);
        if (nearest == null || nearest === currentEtage) { dispatch(setDirectionMovement({ side, direction: null })); return; }
        candidates = [nearest];
        directionMovement = nearest > currentEtage ? 'up' : 'down';
        dispatch(setDirectionMovement({ side, direction: directionMovement }));
    }

    // Weiter zum nächsten Kandidaten
    const nextEtage = candidates[0];

    // Bei nächstem Ziel „Hall-Etage“: Pre-Claim versuchen; schlägt fehl → Neuberechnung.
    const dirsToClaimAtNext: HallDir[] = [];
    if (hallUp.has(nextEtage)) dirsToClaimAtNext.push('up');
    if (hallDown.has(nextEtage)) dirsToClaimAtNext.push('down');
    if (dirsToClaimAtNext.length > 0 && !canClaim(side, nextEtage, dirsToClaimAtNext)) {
        // Etage bereits von der anderen Kabine geclaimt → Plan neu bewerten.
        setT(() => dispatch(processNextCall(side)), 0);
        return;
    }
    if (dirsToClaimAtNext.length > 0) {
        claim(side, nextEtage, dirsToClaimAtNext);
    }

    let dif = Math.abs(nextEtage - currentEtage);
    const travelDuration = dif * 5000;

    dispatch(setTargetEtage({ side, etage: nextEtage }));

    if (Math.abs(dif) > 1) {
        setT(() => {
            dispatch(setCurrentEtage({ side, etage: 2 }));
            dif = 0;
        }, 5000);
    }

    setT(() => {
        dispatch(completeMovement({ side }));

        // Ankunftsetage: offene Anforderungen/Claims für diese Etage zurücksetzen
        dispatch(deactivateRuftaste({ etage: nextEtage, callDirection: 'up' }));
        dispatch(deactivateRuftaste({ etage: nextEtage, callDirection: 'down' }));
        release(nextEtage);

        dispatch(removeZielEtage({ side, etage: nextEtage }));
        dispatch(removeCallFromQueue({ side, etage: nextEtage }));

        dispatch(openDoors({ side }));
        dispatch(setDoorsState({ side, state: 'opening' }));
        setT(() => { dispatch(openDoors({ side })); dispatch(setDoorsState({ side, state: 'closing' })); }, 5000);
        setT(() => {
            dispatch(setDoorsState({ side, state: 'closed' }));
            const s = getState();
            const hasZiel = (s.kabine.kabinen.find((k: Kabine) => k.side === side)?.aktiveZielEtagen ?? []).length > 0;
            const hasHall = (s.ruftaste.aktiveRuftasten ?? []).length > 0;
            if (hasZiel || hasHall) dispatch(processNextCall(side)); else dispatch(setDirectionMovement({ side, direction: null }));
        }, 10000);
    }, travelDuration);
};

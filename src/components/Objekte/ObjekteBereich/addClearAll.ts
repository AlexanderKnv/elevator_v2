import { addAnzeigeToEtage, resetAnzeige } from "../../../store/anzeigeSlice ";
import { addEtage, resetEtagen } from "../../../store/etageSlice";
import { resetKabinen, type Kabine } from "../../../store/kabineSlice";
import { addRuftasteToEtage, resetRuftasten } from "../../../store/ruftasteSlice";
import { addSchachtToEtage, resetSchacht } from "../../../store/schachtSlice";
import type { AppDispatch, RootState } from "../../../store/store";
import { MAX_ETAGEN } from "../../System/EtageZone/EtageZone";
import { clearAllTimeouts } from "../../System/KabinenZone/processNextCall";

export const clearAll =
    () => (dispatch: AppDispatch) => {
        dispatch(clearAllTimeouts);
        dispatch(resetEtagen([]));
        dispatch(resetSchacht({ etagenMitSchacht: [] }));
        dispatch(resetAnzeige([]));
        dispatch(resetRuftasten({ etagenMitRuftasten: [], aktiveRuftasten: [] }));
        dispatch(resetKabinen([]));
    };

export const addAll =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(clearAll());

        for (let i = 0; i < MAX_ETAGEN; i++) {
            dispatch(addEtage());
        }
        const etagen = getState().etage.etagen;

        for (const etage of etagen) {
            dispatch(addSchachtToEtage({ etage, side: 'left' }));
            dispatch(addSchachtToEtage({ etage, side: 'right' }));

            dispatch(addAnzeigeToEtage({ etage, side: 'left' }));
            dispatch(addAnzeigeToEtage({ etage, side: 'right' }));

            dispatch(addRuftasteToEtage(etage));
        }

        const first = Math.min(...etagen);
        const kabinenPreset: Kabine[] = [
            {
                id: 'kabine-left',
                side: 'left',
                currentEtage: first,
                doorsOpen: false,
                targetEtage: null,
                isMoving: false,
                callQueue: [],
                directionMovement: null,
                hasBedienpanel: true,
                aktiveZielEtagen: [],
                doorsState: 'closed',
            },
            {
                id: 'kabine-right',
                side: 'right',
                currentEtage: first,
                doorsOpen: false,
                targetEtage: null,
                isMoving: false,
                callQueue: [],
                directionMovement: null,
                hasBedienpanel: true,
                aktiveZielEtagen: [],
                doorsState: 'closed',
            },
        ];
        dispatch(resetKabinen(kabinenPreset));

        dispatch(
            resetRuftasten({
                etagenMitRuftasten: [...etagen],
                aktiveRuftasten: [],
            })
        );
    };

/** @packageDocumentation
 * # Setup-/Reset-Thunks (`clearAll`, `addAll`)
 *
 * Initialisiert eine komplette Demo-Konfiguration oder leert das System.
 *
 * - `clearAll()`:
 *   - Stoppt alle laufenden Timer (Zeitsteuerungen) und leert deren Registry.
 *   - Setzt **Etagen**, **Schacht**, **Anzeige**, **Ruftasten** und **Kabinen** auf leeren Zustand zurück.
 *
 * - `addAll()`:
 *   - Führt zunächst `clearAll()` aus, um einen definierten Ausgangszustand sicherzustellen.
 *   - Legt `MAX_ETAGEN` Etagen an und liest die resultierende Liste aus dem Store.
 *   - Für **jede** Etage:
 *     - fügt Schacht links **und** rechts hinzu,
 *     - fügt Anzeige links **und** rechts hinzu,
 *     - registriert eine Ruftaste.
 *   - Erzeugt zwei Kabinen-Presets (`kabine-left`, `kabine-right`) auf der **untersten** Etage:
 *     - Türen geschlossen, kein Ziel, nicht in Bewegung, leere Queues, internes Panel aktiviert.
 *   - Synchronisiert die Ruftasten-Konfiguration: `etagenMitRuftasten = etagen`, `aktiveRuftasten = []`.
 */

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

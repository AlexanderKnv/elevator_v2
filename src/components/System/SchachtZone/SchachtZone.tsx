/** @packageDocumentation
 * # Schacht-Zone (`SchachtZone.tsx`)
 *
 * Visualisierung eines Fahrstuhlschachts für eine Etage und Seite (links/rechts).
 *
 * - Liest `doorTimeMs` aus `globals` und setzt daraus die CSS-Transition-Dauer der Türflügel.
 * - Ermittelt die Kabine der angegebenen Seite und berechnet `doorsOpenHere` (Kabine steht auf `etageNumber` **und** `doorsOpen === true`).
 * - Rendert Rahmen/Struktur des Schachts.
 * - Animiert linke/rechte Tür (`.left-door`, `.right-door`) über `transition` und toggelt die Klasse `.open` basierend auf `doorsOpenHere`.
 * - Zeigt einen Entfernen-Button („×“) und dispatcht `removeSchachtFromEtage({ etage, side })`.
 */

import './SchachtZone.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Kabine } from '../../../store/kabineSlice';
import { removeSchachtFromEtage } from '../../../store/schachtSlice';

type SchachtZoneProps = {
    etageNumber: number;
    side: 'left' | 'right';
};

const SchachtZone: React.FC<SchachtZoneProps> = ({ etageNumber, side }) => {
    const doorTimeMs = useSelector((state: RootState) => state.globals.doorTimeMs);

    const dispatch = useDispatch<AppDispatch>();

    const kabine = useSelector((state: RootState) => state.kabine.kabinen.find((k: Kabine) => k.side === side));

    const doorsOpenHere = kabine && kabine.currentEtage === etageNumber && kabine.doorsOpen === true;

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(removeSchachtFromEtage({ etage: etageNumber, side }));
    };

    return (
        <div className="elevator-zone">
            <div className={`elevator-framing ${side}`}>
                <button
                    className="schacht-remove"
                    onClick={handleRemove}
                >
                    ×
                </button>
                <div className="decorative-panel top-panel"></div>
                <div className="elevator-structure">
                    <div className="side-panel left-panel"></div>
                    <div className="elevator-doors">
                        <div style={{ transition: `transform ${doorTimeMs / 1000}s ease-in-out` }} className={`door left-door ${doorsOpenHere ? 'open' : ''}`}></div>
                        <div style={{ transition: `transform ${doorTimeMs / 1000}s ease-in-out` }} className={`door right-door ${doorsOpenHere ? 'open' : ''}`}></div>
                    </div>
                    <div className="side-panel right-panel"></div>
                </div>
            </div>
        </div>
    );
};

export default SchachtZone;
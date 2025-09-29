/** @packageDocumentation
 * # Ruftaste-Zone (`RuftasteZone.tsx`)
 *
 * Visualisierung der Außenruftasten pro Etage.
 *
 * - Rendert pro Etage (aus `state.etage.etagen`) eine Button-Gruppe **↑/↓**, sofern die Etage in `state.ruftaste.etagenMitRuftasten` enthalten ist.
 * - Nutzt `useSelector`, um Etagen und Ruftasten-Etagen aus dem Redux-Store zu lesen.
 * - Rendert **nichts**, wenn es keine Etagen oder keine Etagen mit Ruftasten gibt.
 * - Buttons dienen als **Platzhalter** (ohne Click-Handler); Logik kann später ergänzt werden.
 */

import './RuftasteZone.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

const RuftasteZone: React.FC = () => {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const ruftastenEtagen = useSelector(
        (state: RootState) => state.ruftaste.etagenMitRuftasten
    );

    if (etagen.length === 0 || ruftastenEtagen.length === 0) return null;

    return (
        <div className="ruftaste-zone">
            {etagen.map((etageNr, index) =>
                ruftastenEtagen.includes(etageNr) ? (
                    <div
                        key={etageNr}
                        className="ruf-buttons"
                        style={{
                            top: `${(etagen.length - index - 0.5) * (100 / etagen.length)}%`,
                        }}
                    >
                        <button>⬆️</button>
                        <button>⬇️</button>
                    </div>
                ) : null
            )}
        </div>
    );
};

export default RuftasteZone;


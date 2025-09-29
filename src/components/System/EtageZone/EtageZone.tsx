/** @packageDocumentation
 * # Etagen-Zone (`EtageZone.tsx`)
 *
 * - Akzeptiert den DnD-Typ `'ETAGE'` und fügt bei Drop eine neue Etage hinzu, solange `etagen.length < MAX_ETAGEN`.
 * - Rendert vorhandene Etagen in absteigender Reihenfolge mittels `<EtageVisual etageNumber={nr} />`.
 * - Hebt eine gültige Drop-Zone mit einem Overlay „+ Etage“ hervor; Position richtet sich nach der aktuellen Etagenanzahl.
 * - Verwendet den Redux-Store (`state.etage.etagen`) und `dispatch(addEtage())`.
 * - Nutzt `useDrop`-Collector (`isOverEtage`) für UI-Feedback und `dropRefEtage` als Container-Ref.
 */

import './EtageZone.css';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { addEtage } from '../../../store/etageSlice';
import EtageVisual from './EtageVisual';

export const MAX_ETAGEN = 3;

const EtageZone: React.FC = () => {
    const dispatch = useDispatch();
    const etagen = useSelector((state: RootState) => state.etage.etagen);

    const [{ isOver: isOverEtage }, dropRefEtage] = useDrop(() => ({
        accept: 'ETAGE',
        drop: () => {
            if (etagen.length < MAX_ETAGEN) {
                dispatch(addEtage());
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <div ref={dropRefEtage as unknown as React.Ref<HTMLDivElement>} className="etagen-container" style={{ position: 'relative' }}>
            {[...etagen].reverse().map((nr) => (
                <EtageVisual key={nr} etageNumber={nr} />
            ))}

            {isOverEtage && etagen.length < MAX_ETAGEN && (
                <div
                    className="overlay-etage"
                    style={{
                        position: 'absolute',
                        top: `${(3 - etagen.length - 1) * 33.33}%`,
                        left: 0,
                        right: 0,
                        height: '33.33%',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#000',
                    }}
                >
                    + Etage
                </div>
            )}
        </div>
    );
};

export default EtageZone;
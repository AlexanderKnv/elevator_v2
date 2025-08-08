import React from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { addKabine } from '../../../store/kabineSlice';
import { type AppDispatch, type RootState } from '../../../store/store';
import { activateRuftaste, addRuftasteToEtage } from '../../../store/ruftasteSlice';
import { moveKabineToEtage } from '../KabinenZone/kabineThunks';
import { addSchachtToEtage } from '../../../store/schachtSlice';
import SchachtZone from '../SchachtZone/SchachtZone';

interface EtageVisualProps {
    etageNumber: number;
}

const EtageVisual: React.FC<EtageVisualProps> = ({ etageNumber }) => {
    const dispatch = useDispatch<AppDispatch>();
    const allEtagen = useSelector((state: RootState) => state.etage.etagen);
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);
    const schachtEtagen = useSelector((state: RootState) => state.schacht.etagenMitSchacht);
    const aktiveRuftasten = useSelector((state: RootState) => state.ruftaste.aktiveRuftasten);

    const hasSchacht = schachtEtagen.includes(etageNumber);
    const isActive = (callDirection: 'up' | 'down') =>
        aktiveRuftasten.some(
            (entry) => entry.etage === etageNumber && entry.callDirection === callDirection
        );

    const lowestEtage = Math.min(...allEtagen);
    const highestEtage = Math.max(...allEtagen);

    const ruftasteAktiv = useSelector((state: RootState) =>
        state.ruftaste.etagenMitRuftasten.includes(etageNumber)
    );

    const handleClick = (callDirection: 'up' | 'down') => {
        if (kabine.currentEtage !== etageNumber) {
            dispatch(activateRuftaste({ etage: etageNumber, callDirection }));
        }
        if (kabine.currentEtage === etageNumber && kabine.isMoving === true) {
            dispatch(activateRuftaste({ etage: etageNumber, callDirection }));
        }

        dispatch(moveKabineToEtage(etageNumber));
    };

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: ['KABINE', 'RUFTASTE', 'SCHACHT'],
        //@ts-ignore
        drop: (item, monitor) => {
            const type = monitor.getItemType();
            if (type === 'KABINE') {
                dispatch(addKabine({ etage: 1 }));
            }
            if (type === 'RUFTASTE') {
                dispatch(addRuftasteToEtage(etageNumber));
            }
            if (type === 'SCHACHT') {
                dispatch(addSchachtToEtage(etageNumber));
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        //@ts-ignore
        <div ref={dropRef} className="etage-visual" style={{ position: 'relative' }}>
            <div className="etageCircle">{etageNumber}</div>

            {isOver && (
                <div
                    className="overlay-kabine"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        zIndex: 1,
                    }}
                >
                </div>
            )}

            {ruftasteAktiv && (
                <div className="ruf-buttons">
                    {etageNumber !== highestEtage && (
                        <button
                            className={`ruf-button up ${isActive('up') ? 'active' : ''}`}
                            onClick={() => handleClick('up')}
                        >
                            ⬆️
                        </button>
                    )}
                    {etageNumber !== lowestEtage && (
                        <button
                            className={`ruf-button down ${isActive('down') ? 'active' : ''}`}
                            onClick={() => handleClick('down')}
                        >
                            ⬇️
                        </button>
                    )}
                </div>
            )}

            {hasSchacht && (<SchachtZone />)}

        </div>
    );
};

export default EtageVisual;

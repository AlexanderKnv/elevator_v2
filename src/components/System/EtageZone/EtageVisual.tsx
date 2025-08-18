import React from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { addKabine } from '../../../store/kabineSlice';
import { type AppDispatch, type RootState } from '../../../store/store';
import { activateRuftaste, addRuftasteToEtage } from '../../../store/ruftasteSlice';
import { moveKabineToEtage } from '../KabinenZone/kabineThunks';
import { addSchachtToEtage } from '../../../store/schachtSlice';
import SchachtZone from '../SchachtZone/SchachtZone';
import { addAnzeigeToEtage } from '../../../store/anzeigeSlice ';
import AnzeigeZone from '../AnzeigeZone/AnzeigeZone';

type EtageVisualProps = {
    etageNumber: number;
};

export const EtageVisual: React.FC<EtageVisualProps> = ({ etageNumber }) => {
    const dispatch = useDispatch<AppDispatch>();
    const allEtagen = useSelector((state: RootState) => state.etage.etagen);
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);
    const aktiveRuftasten = useSelector((state: RootState) => state.ruftaste.aktiveRuftasten);
    const anzeigeEtagen = useSelector((s: RootState) => s.anzeige.etagenMitAnzeige);

    const hasLeftSchacht = useSelector((s: RootState) => {
        const entry = s.schacht.etagenMitSchacht.find(e => e.etage === etageNumber);
        return !!entry && entry.sides.includes('left');
    });
    const hasRightSchacht = useSelector((s: RootState) => {
        const entry = s.schacht.etagenMitSchacht.find(e => e.etage === etageNumber);
        return !!entry && entry.sides.includes('right');
    });


    const hasAnzeige = anzeigeEtagen.includes(etageNumber);
    const isActive = (callDirection: 'up' | 'down') =>
        aktiveRuftasten.some(
            (entry) => entry.etage === etageNumber && entry.callDirection === callDirection
        );


    const lowestEtage = Math.min(...allEtagen);
    const highestEtage = Math.max(...allEtagen);

    const ruftasteAktiv = useSelector(
        (state: RootState) => state.ruftaste.etagenMitRuftasten.includes(etageNumber)
    );

    const handleClick = (callDirection: 'up' | 'down') => {
        if (kabine.currentEtage === etageNumber && (kabine.doorsState === 'opening' || kabine.doorsState === 'closing')) {
            return;
        }
        dispatch(activateRuftaste({ etage: etageNumber, callDirection }));
        dispatch(moveKabineToEtage(etageNumber));
    };

    const handleDrop = (side: 'left' | 'right', itemType: string | symbol | null) => {
        if (itemType === 'KABINE') {
            dispatch(addKabine({ etage: 1 }));
        }
        if (itemType === 'RUFTASTE') {
            dispatch(addRuftasteToEtage(etageNumber));
        }
        if (itemType === 'SCHACHT') {
            dispatch(addSchachtToEtage({ etage: etageNumber, side }));
        }
        if (itemType === 'ANZEIGE') {
            dispatch(addAnzeigeToEtage(etageNumber));
        }
    };

    const [{ draggingType }] = useDrop(() => ({
        accept: ['KABINE', 'RUFTASTE', 'SCHACHT', 'ANZEIGE'],
        collect: (monitor) => ({
            draggingType: monitor.getItemType() as string | symbol | null,
        }),
    }));

    const [{ isOverLeft, canDropLeft }, dropLeftRef] = useDrop(() => ({
        accept: ['KABINE', 'SCHACHT', 'ANZEIGE'],
        drop: (_item, monitor) => {
            handleDrop('left', monitor.getItemType());
        },
        collect: (monitor) => ({
            isOverLeft: monitor.isOver({ shallow: true }),
            canDropLeft: monitor.canDrop(),
        }),
    }), [etageNumber]);

    const [{ isOverRight, canDropRight }, dropRightRef] = useDrop(() => ({
        accept: ['KABINE', 'SCHACHT', 'ANZEIGE'],
        drop: (_item, monitor) => {
            handleDrop('right', monitor.getItemType());
        },
        collect: (monitor) => ({
            isOverRight: monitor.isOver({ shallow: true }),
            canDropRight: monitor.canDrop(),
        }),
    }), [etageNumber]);

    const [{ isOverFull, canDropFull }, dropFullRef] = useDrop(() => ({
        accept: ['RUFTASTE'],
        drop: (_item, monitor) => handleDrop('left', monitor.getItemType()),
        collect: (monitor) => ({
            isOverFull: monitor.isOver({ shallow: true }),
            canDropFull: monitor.canDrop(),
        }),
    }), [etageNumber]);

    const halvesActive = draggingType !== null && draggingType !== 'RUFTASTE';
    const fullActive = draggingType === 'RUFTASTE';

    return (
        <div className="etage-visual" style={{ position: 'relative' }}>
            <div className="etageCircle">{etageNumber}</div>

            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
                {/* Полноэкранная зона для RUFTASTE */}
                <div
                    ref={dropFullRef as unknown as React.Ref<HTMLDivElement>}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: fullActive ? 'auto' : 'none',
                        backgroundColor:
                            fullActive && isOverFull && canDropFull ? 'rgba(0,128,255,0.18)' : 'transparent',
                        outline: fullActive && isOverFull && canDropFull ? '2px solid rgba(0,128,255,0.5)' : 'none',
                        outlineOffset: -2,
                        transition: 'background-color 120ms ease',
                    }}
                />
                {/* Две половинки для KABINE/SCHACHT/ANZEIGE */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                    <div
                        ref={dropLeftRef as unknown as React.Ref<HTMLDivElement>}
                        style={{
                            flex: 1,
                            pointerEvents: halvesActive ? 'auto' : 'none',
                            backgroundColor:
                                halvesActive && isOverLeft && canDropLeft ? 'rgba(0,128,255,0.18)' : 'transparent',
                            outline: halvesActive && isOverLeft && canDropLeft ? '2px solid rgba(0,128,255,0.5)' : 'none',
                            outlineOffset: -2,
                            transition: 'background-color 120ms ease',
                        }}
                    />
                    <div
                        ref={dropRightRef as unknown as React.Ref<HTMLDivElement>}
                        style={{
                            flex: 1,
                            pointerEvents: halvesActive ? 'auto' : 'none',
                            backgroundColor:
                                halvesActive && isOverRight && canDropRight ? 'rgba(0,128,255,0.18)' : 'transparent',
                            outline: halvesActive && isOverRight && canDropRight ? '2px solid rgba(0,128,255,0.5)' : 'none',
                            outlineOffset: -2,
                            transition: 'background-color 120ms ease',
                        }}
                    />
                </div>
            </div>

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

            {hasLeftSchacht && <SchachtZone etageNumber={etageNumber} side="left" />}
            {hasRightSchacht && <SchachtZone etageNumber={etageNumber} side="right" />}

            {hasAnzeige && <AnzeigeZone />}
        </div>
    );
};

export default EtageVisual;

import React from 'react';
import './KabinenZone.css';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import Bedienpanel from '../Bedienpanel/Bedienpanel';
import { useDrop } from 'react-dnd';
import { addBedienpanelToKabine, removeKabine } from '../../../store/kabineSlice';

type KabinenZoneProps = {
    side: 'left' | 'right';
};

const KabinenZone: React.FC<KabinenZoneProps> = ({ side }) => {
    const kabine = useSelector((state: RootState) => state.kabine.kabinen.find(k => k.side === side));
    const totalEtagen = useSelector((state: RootState) => state.etage.etagen.length);
    const speedMs = useSelector((state: RootState) => state.globals.speedMs);
    const doorTimeMs = useSelector((state: RootState) => state.globals.doorTimeMs);

    const dispatch = useDispatch();

    const [{ }, dropRef] = useDrop(() => ({
        accept: 'BEDIENPANEL',
        canDrop: () => !kabine?.hasBedienpanel,
        drop: () => {
            if (!kabine?.hasBedienpanel) {
                dispatch(addBedienpanelToKabine({ side }));
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    if (!kabine || totalEtagen === 0) return null;
    let top = (3 - kabine.currentEtage) * (100 / 3);

    if (kabine.targetEtage) {
        top = (3 - kabine.targetEtage) * (100 / 3);
    }

    const travelDuration = kabine?.targetEtage != null
        ? Math.abs(kabine.currentEtage - kabine.targetEtage) * (speedMs / 1000)
        : 0;

    const opacity = kabine.isMoving ? 0.2 : 1;

    const handleRemoveKabine = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(removeKabine({ side }));
    };

    return (
        <div
            className={`lift-cabin ${side}`}
            //@ts-ignore
            ref={dropRef}
            style={{
                top: `${top}%`,
                transition: `top ${travelDuration}s ease-in-out`,
                opacity: `${opacity}`,
            }}
        >
            <button
                className="kabine-remove"
                onClick={handleRemoveKabine}
            >
                ×
            </button>
            <div style={{ transition: `transform ${doorTimeMs / 1000}s ease-in-out` }} className={`door left ${kabine.doorsOpen ? 'open' : ''}`} />
            <div style={{ transition: `transform ${doorTimeMs / 1000}s ease-in-out` }} className={`door right ${kabine.doorsOpen ? 'open' : ''}`} />
            {kabine.hasBedienpanel && <Bedienpanel side={side} />}
        </div>
    );
};

export default KabinenZone;

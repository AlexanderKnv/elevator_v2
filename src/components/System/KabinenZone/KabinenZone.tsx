import React from 'react';
import './KabinenZone.css';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import Bedienpanel from '../Bedienpanel/Bedienpanel';
import { useDrop } from 'react-dnd';
import { addBedienpanelToKabine } from '../../../store/kabineSlice';

const KabinenZone: React.FC = () => {
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);
    const totalEtagen = useSelector((state: RootState) => state.etage.etagen.length);
    const dispatch = useDispatch();

    const [{ }, dropRef] = useDrop(() => ({
        accept: 'BEDIENPANEL',
        canDrop: () => !kabine?.hasBedienpanel,
        drop: () => {
            if (!kabine?.hasBedienpanel) {
                dispatch(addBedienpanelToKabine());
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
        ? Math.abs(kabine.currentEtage - kabine.targetEtage) * 5
        : 0;

    const opacity = kabine.isMoving ? 0.2 : 1;

    return (
        <div
            className="lift-cabin"
            //@ts-ignore
            ref={dropRef}
            style={{
                top: `${top}%`,
                transition: `top ${travelDuration}s ease-in-out`,
                opacity: `${opacity}`,
            }}
        >
            <div className={`door left ${kabine.doorsOpen ? 'open' : ''}`} />
            <div className={`door right ${kabine.doorsOpen ? 'open' : ''}`} />
            {kabine.hasBedienpanel && <Bedienpanel />}
        </div>
    );
};

export default KabinenZone;

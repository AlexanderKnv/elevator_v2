import React from 'react';
import './KabinenZone.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

const KabinenZone: React.FC = () => {
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);
    const totalEtagen = useSelector((state: RootState) => state.etage.etagen.length);

    if (!kabine || totalEtagen === 0) return null;
    let top = (3 - kabine.currentEtage) * (100 / 3);

    if (kabine.targetEtage) {
        top = (3 - kabine.targetEtage) * (100 / 3);
    }

    const travelDuration = kabine?.targetEtage != null
        ? Math.abs(kabine.currentEtage - kabine.targetEtage) * 5
        : 0;

    return (
        <div
            className="lift-cabin"
            style={{
                top: `${top}%`,
                transition: `top ${travelDuration}s ease-in-out`,
            }}
        >
            <div className={`door left ${kabine.doorsOpen ? 'open' : ''}`} />
            <div className={`door right ${kabine.doorsOpen ? 'open' : ''}`} />
        </div>
    );
};

export default KabinenZone;

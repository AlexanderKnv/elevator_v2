import React from 'react';
import './KabinenZone.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

const KabinenZone: React.FC = () => {
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);
    const totalEtagen = useSelector((state: RootState) => state.etage.etagen.length);

    if (!kabine || totalEtagen === 0) return null;
    const top = (3 - kabine.currentEtage) * (100 / 3);

    return (
        <div
            className="lift-cabin"
            style={{
                top: `${top}%`,
            }}
        >
            <div className={`door left ${kabine.doorsOpen ? 'open' : ''}`} />
            <div className={`door right ${kabine.doorsOpen ? 'open' : ''}`} />
        </div>
    );
};

export default KabinenZone;

import React from 'react';
import './SystemBereich.css';
import EtageZone from '../EtageZone/EtageZone';
import KabinenZone from '../KabinenZone/KabinenZone';
import type { RootState } from '../../../store/store';
import { useSelector } from 'react-redux';

const SystemBereich: React.FC = () => {

    const hasLeftKabine = useSelector((s: RootState) => {
        if (s.kabine.kabinen.some(k => k.side === 'left'))
            return 'left'
    });

    const hasRightKabine = useSelector((s: RootState) => {
        if (s.kabine.kabinen.some(k => k.side === 'right'))
            return 'right'
    });

    return (
        <div className="system-bereich">
            <EtageZone />
            {hasLeftKabine && <KabinenZone side="left" />}
            {hasRightKabine && <KabinenZone side="right" />}
        </div>
    );
};

export default SystemBereich;

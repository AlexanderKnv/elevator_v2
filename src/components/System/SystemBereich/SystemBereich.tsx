import React from 'react';
import './SystemBereich.css';
import EtageZone from '../EtageZone/EtageZone';
import KabinenZone from '../KabinenZone/KabinenZone';

const SystemBereich: React.FC = () => {
    return (
        <div className="system-bereich">
            <EtageZone />
            <KabinenZone />
        </div>
    );
};

export default SystemBereich;
